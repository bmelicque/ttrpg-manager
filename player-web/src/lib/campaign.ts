export function getCampaignId(): string | null {
    let id = sessionStorage.getItem("campaign");
    if (id) return id;
    const params = new URLSearchParams(window.location.search);
    id = params.get("campaign");
    if (id) sessionStorage.setItem("campaign", id);
    return id;
}
