package com.praveen.leadflow.lead;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/capture")
public class CaptureController {

    private final LeadService leadService;

    public CaptureController(LeadService leadService) {
        this.leadService = leadService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public LeadResponse capture(@Valid @RequestBody CaptureRequest request) {
        return leadService.captureLead(request);
    }
}
