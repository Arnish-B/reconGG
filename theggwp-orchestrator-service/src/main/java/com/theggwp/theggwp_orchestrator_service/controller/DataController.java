package com.theggwp.theggwp_orchestrator_service.controller;

import com.theggwp.theggwp_orchestrator_service.service.PandascoreService;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class DataController {

    private final PandascoreService service;

    public DataController(PandascoreService service) {
        this.service = service;
    }

    @GetMapping(value = "/getData", produces = MediaType.APPLICATION_JSON_VALUE)
    public String getData() {
        return service.getLatest();
    }
}
