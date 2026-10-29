package com.activeage.core;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class ActiveAgeCoreApplication {

	public static void main(String[] args) {
		SpringApplication.run(ActiveAgeCoreApplication.class, args);
	}

}
