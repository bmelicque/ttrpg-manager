import { useState } from "preact/hooks";
import { AppLayout, type Page } from "./components/Layout";
import { Campaigns } from "./features/campaigns/Campaigns";
import { CampaignDetails } from "./features/campaigns/CampaignDetails";
import { Dashboard } from "./features/dashboard/Dashboard";
import "../shared/styles/base.css";
import "../shared/styles/buttons.css";
import "../shared/styles/forms.css";
import "./styles.css";

export default function App() {
    const [page, setPage] = useState<Page>("dashboard");
    const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(
        null,
    );

    return (
        <AppLayout page={page} onNavigate={setPage}>
            {page === "dashboard" && <Dashboard onNavigate={setPage} />}

            {page === "campaigns" &&
                (selectedCampaignId !== null ? (
                    <CampaignDetails
                        campaignId={selectedCampaignId}
                        onBack={() => setSelectedCampaignId(null)}
                    />
                ) : (
                    <Campaigns onOpen={(id) => setSelectedCampaignId(id)} />
                ))}

            {page === "characters" && (
                <Placeholder
                    title="Characters"
                    description="Your characters will live here."
                />
            )}

            {page === "maps" && (
                <Placeholder
                    title="Battle maps"
                    description="Your maps and tokens will live here."
                />
            )}
        </AppLayout>
    );
}

function Placeholder({
    title,
    description,
}: {
    title: string;
    description: string;
}) {
    return (
        <div class="page-heading">
            <div>
                <p class="eyebrow">WORKSPACE</p>
                <h1>{title}</h1>
                <p class="muted">{description}</p>
            </div>
        </div>
    );
}
