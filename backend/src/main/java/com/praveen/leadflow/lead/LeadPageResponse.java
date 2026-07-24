package com.praveen.leadflow.lead;

import java.util.List;

public record LeadPageResponse(List<LeadResponse> items, PageInfo page, LeadTotals totals) {
}
