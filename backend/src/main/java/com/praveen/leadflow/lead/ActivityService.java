package com.praveen.leadflow.lead;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

@Service
public class ActivityService {

    private final List<ActivityRecord> activities = Collections.synchronizedList(new ArrayList<>());

    public ActivityService() {
        // Add default system creation activities for the sample leads to look rich
        logActivity(UUID.fromString("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"), "Lead captured from Website", "System");
        logActivity(UUID.fromString("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"), "Lead status marked as Qualified", "Ravi Rep");
        logActivity(UUID.fromString("cccccccc-cccc-cccc-cccc-cccccccccccc"), "Lead won after proposal acceptance", "Asha Admin");
    }

    public void logActivity(UUID leadId, String content, String creatorName) {
        activities.add(new ActivityRecord(
                UUID.randomUUID(),
                leadId,
                content,
                creatorName,
                LocalDateTime.now()
        ));
    }

    public List<ActivityResponse> getActivitiesForLead(UUID leadId) {
        return activities.stream()
                .filter(activity -> activity.leadId().equals(leadId))
                .sorted(Comparator.comparing(ActivityRecord::createdAt).reversed())
                .map(activity -> new ActivityResponse(
                        activity.id(),
                        activity.content(),
                        activity.creatorName(),
                        activity.createdAt()
                ))
                .toList();
    }
}
