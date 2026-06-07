export function GET() { return new Response(JSON.stringify({p:1}), {headers:{'content-type':'application/json'}}); }
