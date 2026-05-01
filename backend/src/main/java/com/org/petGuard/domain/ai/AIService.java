package com.org.petGuard.domain.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import com.org.petGuard.domain.pet.PetRequest;
import com.org.petGuard.domain.claim.Claim;
import com.org.petGuard.domain.claim.ClaimRepository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AIService {

    @Value("${ai.service.url}")
    private String aiServiceUrl;

    @Value("${ai.api.key}")
    private String aiApiKey;

    @Autowired
    private ClaimRepository claimRepository;
    @Autowired
    private RestTemplate restTemplate;
    @Autowired
    private ObjectMapper objectMapper;

    // @Async
    @Transactional
    public PetRequest processEligibility(MultipartFile file) {
        try {
            // Prepare multipart request
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);
            headers.add("x-api-key", aiApiKey);

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("file", new ByteArrayResource(file.getBytes()) {
                @Override
                public String getFilename() {
                    return file.getOriginalFilename();
                }
            });

            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

            String response = restTemplate.postForObject(
                    aiServiceUrl + "/api/v1/ai/eligibility-assessments",
                    requestEntity,
                    String.class);

            JsonNode jsonNode = objectMapper.readTree(response);
            // System.out.println("Response from AI Service: " + response);
            // System.out.println("\nAI Service Response: " + jsonNode + "\n");

            PetRequest petRequest = PetRequest.builder()
                    .name(jsonNode.has("name") ? jsonNode.get("name").asText() : null)
                    .species(jsonNode.has("species") ? jsonNode.get("species").asText() : null)
                    .breed(jsonNode.has("breed") ? jsonNode.get("breed").asText() : null)
                    .age(jsonNode.has("age") ? (jsonNode.get("age").isNull() ? null : jsonNode.get("age").asInt())
                            : null)
                    .gender(jsonNode.has("gender") ? jsonNode.get("gender").asText() : null)
                    .medicalSummary(jsonNode.has("medicalSummary") ? jsonNode.get("medicalSummary").asText() : null)
                    .preExistingConditions(
                            jsonNode.has("preExistingConditions") ? objectMapper.convertValue(
                                    jsonNode.get("preExistingConditions"),
                                    objectMapper.getTypeFactory().constructCollectionType(List.class, String.class))
                                    : null)
                    .eligibilityStatus(
                            jsonNode.has("eligibilityStatus") ? jsonNode.get("eligibilityStatus").asText() : null)
                    .eligibilityReason(
                            jsonNode.has("eligibilityReason") ? jsonNode.get("eligibilityReason").asText() : null)
                    .build();
            return petRequest;
        } catch (Exception e) {
            System.err.println("Eligibility check failed: " + e.getMessage());
            return null;
        }
    }

    @Async
    @Transactional
    public void processClaimReceiptAsync(Long claimId, MultipartFile receipt) {
        try {
            Claim claim = claimRepository.findById(claimId)
                    .orElseThrow(() -> new RuntimeException("Claim not found"));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);
            headers.add("x-api-key", aiApiKey);

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("file", new ByteArrayResource(receipt.getBytes()) {
                @Override
                public String getFilename() {
                    return receipt.getOriginalFilename();
                }
            });

            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

            String response = restTemplate.postForObject(
                    aiServiceUrl + "/api/v1/ai/receipt-extractions",
                    requestEntity,
                    String.class);

            JsonNode jsonNode = objectMapper.readTree(response);

            claim.setTreatmentDate(LocalDate.parse(jsonNode.get("treatment_date").asText()));
            claim.setVetClinicName(jsonNode.get("vet_clinic_name").asText());
            claim.setDiagnosis(jsonNode.get("diagnosis").asText());
            claim.setTreatmentType(jsonNode.get("treatment_type").asText());
            claim.setMedications(jsonNode.get("medications").asText());
            claim.setClaimAmount(new BigDecimal(jsonNode.get("total_amount").asText()));
            claim.setStatus(Claim.ClaimStatus.PENDING);

            claimRepository.save(claim);

        } catch (Exception e) {
            System.err.println("Receipt extraction failed: " + e.getMessage());
        }
    }

    public String getChatbotResponse(String message, String petContext) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.add("x-api-key", aiApiKey);

            Map<String, String> requestBody = new HashMap<>();
            requestBody.put("message", message);
            if (petContext != null) {
                requestBody.put("pet_context", petContext);
            }

            HttpEntity<Map<String, String>> requestEntity = new HttpEntity<>(requestBody, headers);

            String response = restTemplate.postForObject(
                    aiServiceUrl + "/api/v1/ai/chats",
                    requestEntity,
                    String.class);

            JsonNode jsonNode = objectMapper.readTree(response);
            return jsonNode.get("response").asText();

        } catch (Exception e) {
            System.err.println("Chatbot request failed: " + e.getMessage());
            return "I'm sorry, I'm having trouble processing your request right now. Please try again later.";
        }
    }
}
