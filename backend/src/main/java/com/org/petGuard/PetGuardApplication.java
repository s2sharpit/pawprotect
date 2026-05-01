package com.org.petGuard;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class PetGuardApplication {

	public static void main(String[] args) {
		SpringApplication.run(PetGuardApplication.class, args);
	}

}
