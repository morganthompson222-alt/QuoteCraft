import { ProfilePage } from "../../components/settings/ProfilePage";
import { BillingPage } from "../../components/settings/BillingPage";
import { DeleteAccountSection } from "../../components/settings/DeleteAccountSection";

export default function SettingsRoute() {
  return (
    <section className="workspace-page">
      <div className="workspace-page__header">
        <div>
          <p className="workspace-page__eyebrow">Settings</p>
          <h1>Workspace settings</h1>
          <p>Manage your profile, company details, and subscription.</p>
        </div>
      </div>

      <div className="settings-sections">
        <ProfilePage />
        <BillingPage />
        <DeleteAccountSection />
      </div>
    </section>
  );
}
