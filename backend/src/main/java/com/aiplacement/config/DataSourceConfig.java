package com.aiplacement.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.DriverManager;

@Configuration
public class DataSourceConfig {

    @Value("${spring.datasource.url}")
    private String mysqlUrl;

    @Value("${spring.datasource.username}")
    private String mysqlUser;

    @Value("${spring.datasource.password}")
    private String mysqlPassword;

    @Value("${spring.datasource.driverClassName}")
    private String mysqlDriver;

    @Bean
    @Primary
    public DataSource dataSource() {
        try {
            System.out.println(">>> AI Platform: Attempting MySQL database connection...");
            System.out.println(">>> JDBC URL: " + mysqlUrl);
            System.out.println(">>> Username: " + mysqlUser);
            
            // Register Driver
            Class.forName(mysqlDriver);
            
            // Attempt to establish quick connection with 2-second timeout to test credentials
            DriverManager.setLoginTimeout(2);
            try (Connection conn = DriverManager.getConnection(mysqlUrl, mysqlUser, mysqlPassword)) {
                System.out.println(">>> [SUCCESS] MySQL Database connection established successfully!");
                return DataSourceBuilder.create()
                        .url(mysqlUrl)
                        .username(mysqlUser)
                        .password(mysqlPassword)
                        .driverClassName(mysqlDriver)
                        .build();
            }
        } catch (Exception e) {
            System.err.println(">>> [WARNING] MySQL database connection failed: " + e.getMessage());
            System.out.println(">>> Fallback system triggered: Activating zero-config H2 In-Memory database...");
            System.out.println(">>> Demo data will be pre-seeded automatically.");
            
            return DataSourceBuilder.create()
                    .url("jdbc:h2:mem:placementdb;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE")
                    .username("sa")
                    .password("password")
                    .driverClassName("org.h2.Driver")
                    .build();
        }
    }
}
