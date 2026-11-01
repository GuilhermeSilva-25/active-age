package com.activeage.core;

import jakarta.annotation.PostConstruct;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

import java.util.TimeZone;

@SpringBootApplication
@EnableScheduling
public class ActiveAgeCoreApplication {

	@PostConstruct
	public void init() {
		// Define o fuso horário oficial de Brasília para toda a aplicação
		TimeZone.setDefault(TimeZone.getTimeZone("America/Sao_Paulo"));
	}

	public static void main(String[] args) {
		SpringApplication.run(ActiveAgeCoreApplication.class, args);
	}

}
