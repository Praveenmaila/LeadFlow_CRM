package com.praveen.leadflow.lead;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import com.praveen.leadflow.user.AppUser;
import com.praveen.leadflow.user.DemoUserService;

@Service
public class NoteService {

    private final List<NoteRecord> notes = Collections.synchronizedList(new ArrayList<>());
    private final DemoUserService userService;

    public NoteService(DemoUserService userService) {
        this.userService = userService;
    }

    public NoteResponse addNote(UUID leadId, String content, Authentication authentication) {
        AppUser author = userService.findByEmail(authentication.getName())
                .orElseThrow(() -> new IllegalStateException("Authenticated user not found"));

        NoteRecord note = new NoteRecord(
                UUID.randomUUID(),
                leadId,
                author.email(),
                author.fullName(),
                content,
                LocalDateTime.now());

        notes.add(note);
        return toResponse(note);
    }

    public List<NoteResponse> getNotesForLead(UUID leadId) {
        return notes.stream()
                .filter(note -> note.leadId().equals(leadId))
                .sorted(Comparator.comparing(NoteRecord::createdAt).reversed())
                .map(this::toResponse)
                .toList();
    }

    private NoteResponse toResponse(NoteRecord note) {
        return new NoteResponse(note.id(), note.authorName(), note.content(), note.createdAt());
    }
}
