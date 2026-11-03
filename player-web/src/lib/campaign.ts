export function getCampaignId(): string | null {
    const params = new URLSearchParams(window.location.search);
    return params.get("campaign");
}
