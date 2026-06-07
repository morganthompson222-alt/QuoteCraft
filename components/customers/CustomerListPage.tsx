"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { CustomerCreateModal } from "./CustomerCreateModal";
import { useRegion } from "../../hooks/useRegion";
import { CustomerEditModal } from "./CustomerEditModal";
import { ConfirmDialog } from "../ConfirmDialog";
import { useToast } from "../Toast";

type Customer = {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  company: string | null;
  totalQuotes: number;
  createdAt: string;
};

type CustomerListResponse = {
  customers: Customer[];
  total: number;
  page: number;
  limit: number;
};

type CustomerListState =
  | { status: "loading"; data?: undefined; error?: undefined }
  | { status: "error"; data?: undefined; error: string }
  | { status: "success"; data: CustomerListResponse; error?: undefined };

async function readErrorMessage(response: Response) {
  try {
    const json = await response.json();
    const error = json?.error;
    if (typeof error === "string") return error;
    if (error && typeof error.message === "string") return error.message;
    if (typeof json?.message === "string") return json.message;
    return "Unable to load customers.";
  } catch {
    return "Unable to load customers.";
  }
}

export function CustomerListPage() {
  const { formatDate } = useRegion();
  const [state, setState] = useState<CustomerListState>({
    status: "loading",
  });
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editCustomerId, setEditCustomerId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { toast } = useToast();

  const query = useMemo(() => {
    const params = new URLSearchParams({
      page: "1",
      limit: "10",
    });

    if (search.trim()) {
      params.set("search", search.trim());
    }

    return params.toString();
  }, [search]);

  useEffect(() => {
    let isCurrent = true;

    async function loadCustomers() {
      setState({ status: "loading" });

      try {
        const token = window.localStorage.getItem("quotecraft_token");
        const response = await fetch(`/api/customers/list?${query}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (!response.ok) {
          throw new Error(await readErrorMessage(response));
        }

        const data = (await response.json()) as CustomerListResponse;

        if (isCurrent) {
          setState({ status: "success", data });
        }
      } catch (error) {
        if (isCurrent) {
          setState({
            status: "error",
            error:
              error instanceof Error
                ? error.message
                : "Unable to load customers.",
          });
        }
      }
    }

    loadCustomers();

    return () => {
      isCurrent = false;
    };
  }, [query, refreshKey]);

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSearch(searchInput);
  }

  const customers = state.status === "success" ? state.data.customers : [];
  const total = state.status === "success" ? state.data.total : 0;
  const isEmpty = state.status === "success" && customers.length === 0;
  const isSearching = search.trim().length > 0;
  const deleteName = deleteTarget?.name ?? "this customer";

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);

    try {
      const token = window.localStorage.getItem("quotecraft_token");
      const response = await fetch(`/api/customers/${deleteTarget.id}/delete`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!response.ok) {
        const msg = await readErrorMessage(response);
        throw new Error(msg);
      }

      toast("Customer deleted.", "success");
      setDeleteTarget(null);
      setRefreshKey((k) => k + 1);
    } catch (error) {
      toast(
        error instanceof Error ? error.message : "Failed to delete customer.",
        "error",
      );
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <section className="workspace-page">
      <div className="workspace-page__header">
        <div>
          <p className="workspace-page__eyebrow">Customers</p>
          <h1>Customer records</h1>
          <p>
            Find customers, review quote activity, and keep contact details ready
            for the next estimate.
          </p>
        </div>
        <button className="button button--primary" type="button" onClick={() => setShowCreateModal(true)}>
          New customer
        </button>
      </div>

      <div className="toolbar">
        <form className="search-form" onSubmit={handleSearch}>
          <label htmlFor="customer-search">Search customers</label>
          <div className="search-form__row">
            <div className="search-form__wrapper">
              <input
                id="customer-search"
                name="search"
                type="search"
                placeholder="Name, company, or email"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
              />
              {searchInput ? (
                <button
                  className="search-form__clear"
                  type="button"
                  aria-label="Clear search"
                  onClick={() => {
                    setSearchInput("");
                    setSearch("");
                  }}
                >
                  &times;
                </button>
              ) : null}
            </div>
            <button className="button button--secondary" type="submit">
              Search
            </button>
          </div>
        </form>

        <div className="summary-chip" aria-live="polite">
          {state.status === "success"
            ? isSearching
              ? `${customers.length} of ${total} for "${search}"`
              : `${total} total`
            : "Loading"}
        </div>
      </div>

      {state.status === "loading" ? (
        <div className="table-card" aria-busy="true">
          <div className="table-skeleton table-skeleton--header" />
          {Array.from({ length: 5 }).map((_, index) => (
            <div className="table-skeleton" key={index} />
          ))}
        </div>
      ) : null}

      {state.status === "error" ? (
        <div className="state-panel state-panel--error" role="alert">
          <h2>Customers could not be loaded</h2>
          <p>{state.error}</p>
          <button
            className="button button--secondary"
            type="button"
            onClick={() => setRefreshKey((current) => current + 1)}
          >
            Try again
          </button>
        </div>
      ) : null}

      {isEmpty ? (
        <div className="state-panel">
          <h2>{isSearching ? "No customers match your search" : "No customers yet"}</h2>
          <p>
            {isSearching
              ? "Adjust the search term or clear it to see all customer records."
              : "Create your first customer record before drafting a quote."}
          </p>
          {isSearching ? (
            <button
              className="button button--secondary"
              type="button"
              onClick={() => {
                setSearchInput("");
                setSearch("");
              }}
            >
              Clear search
            </button>
          ) : (
            <button className="button button--primary" type="button" onClick={() => setShowCreateModal(true)}>
              New customer
            </button>
          )}
        </div>
      ) : null}

      {state.status === "success" && customers.length > 0 ? (
        <div className="table-card">
          <div className="customer-table customer-table--head">
            <span>Customer</span>
            <span>Contact</span>
            <span>Quotes</span>
            <span>Created</span>
            <span>Actions</span>
          </div>

          {customers.map((customer) => (
            <article className="customer-table customer-table--row" key={customer.id}>
              <div>
                <h2>
                  <Link href={`/customers/${customer.id}`} style={{ color: "inherit" }}>
                    {customer.name}
                  </Link>
                </h2>
                <p>{customer.company ?? "Individual customer"}</p>
              </div>
              <div>
                <a href={`mailto:${customer.email}`}>{customer.email}</a>
                <p>{customer.phone ?? "No phone saved"}</p>
              </div>
              <div>
                <span className="quote-count">{customer.totalQuotes}</span>
              </div>
              <div>
                <time dateTime={customer.createdAt}>
                  {formatDate(customer.createdAt)}
                </time>
              </div>
              <div className="customer-actions">
                <button
                  className="button button--ghost"
                  type="button"
                  style={{ fontSize: 13, minHeight: 32, padding: "0 10px" }}
                  onClick={() => setEditCustomerId(customer.id)}
                >
                  Edit
                </button>
                <button
                  className="button button--ghost"
                  type="button"
                  style={{ fontSize: 13, minHeight: 32, padding: "0 10px", color: "var(--danger)" }}
                  onClick={() => setDeleteTarget({ id: customer.id, name: customer.name })}
                >
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : null}
      <CustomerCreateModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={() => setRefreshKey((k) => k + 1)}
      />
      <CustomerEditModal
        open={editCustomerId !== null}
        customerId={editCustomerId}
        onClose={() => setEditCustomerId(null)}
        onUpdated={() => setRefreshKey((k) => k + 1)}
      />
      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete customer"
        message={`Are you sure you want to delete ${deleteName}? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        loading={deleteLoading}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </section>
  );
}
