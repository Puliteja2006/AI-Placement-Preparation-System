package com.aiplacement.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.sql.Connection;
import java.sql.DriverManager;

@Configuration
public class DataSourceConfig {

    private static final Logger log = LoggerFactory.getLogger(DataSourceConfig.class);

    private static final String LOCAL_MYSQL_URL =
            "jdbc:mysql://localhost:3306/placement_prep?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true";

    @Value("${spring.datasource.url:}")
    private String configuredUrl;

    @Value("${spring.datasource.username:}")
    private String configuredUser;

    @Value("${spring.datasource.password:}")
    private String configuredPassword;

    @Value("${DATABASE_URL:}")
    private String databaseUrlEnv;

    @Value("${app.db.pool-size:5}")
    private int poolSize;

    @Bean
    @Primary
    public DataSource dataSource() {
        String rawUrl = firstNonBlank(configuredUrl, databaseUrlEnv);

        if (!rawUrl.isBlank()) {
            ConnectionInfo info = normalize(rawUrl, configuredUser, configuredPassword);
            log.info(">>> Database: connecting to {}", safeUrl(info.jdbcUrl));
            HikariDataSource ds = build(info);
            try (Connection ignored = ds.getConnection()) {
                log.info(">>> [SUCCESS] Database connection established.");
            } catch (Exception e) {
                ds.close();
                throw new IllegalStateException("Cannot connect to the configured database ("
                        + safeUrl(info.jdbcUrl) + "). Check SPRING_DATASOURCE_URL / USERNAME / PASSWORD. Cause: "
                        + e.getMessage(), e);
            }
            return ds;
        }

        // Local development: MySQL on localhost, else in-memory H2
        ConnectionInfo mysql = new ConnectionInfo(LOCAL_MYSQL_URL,
                firstNonBlank(configuredUser, "root"), configuredPassword, "com.mysql.cj.jdbc.Driver");
        try {
            Class.forName(mysql.driver);
            DriverManager.setLoginTimeout(2);
            try (Connection ignored = DriverManager.getConnection(mysql.jdbcUrl, mysql.user, mysql.password)) {
                log.info(">>> Local MySQL connected.");
            }
            return build(mysql);
        } catch (Exception e) {
            log.warn(">>> Local MySQL not available. Using in-memory H2 (data lost on restart).");
            return build(new ConnectionInfo(
                    "jdbc:h2:mem:placementdb;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE",
                    "sa", "password", "org.h2.Driver"));
        }
    }

    private HikariDataSource build(ConnectionInfo info) {
        HikariConfig cfg = new HikariConfig();
        cfg.setJdbcUrl(info.jdbcUrl);
        cfg.setUsername(info.user);
        cfg.setPassword(info.password);
        cfg.setDriverClassName(info.driver);
        cfg.setMaximumPoolSize(Math.max(2, poolSize));
        cfg.setMinimumIdle(1);
        cfg.setConnectionTimeout(20_000);
        cfg.setInitializationFailTimeout(-1);
        return new HikariDataSource(cfg);
    }

    static ConnectionInfo normalize(String url, String user, String password) {
        String u = url.trim();
        String dbUser = user == null ? "" : user;
        String dbPass = password == null ? "" : password;

        if (!u.startsWith("jdbc:")) {
            URI uri = URI.create(u);
            String scheme = uri.getScheme();
            String jdbcScheme = scheme.startsWith("postgres") ? "postgresql" : scheme;
            String userInfo = uri.getUserInfo();
            if (userInfo != null) {
                int colon = userInfo.indexOf(':');
                String urlUser = colon >= 0 ? userInfo.substring(0, colon) : userInfo;
                String urlPass = colon >= 0 ? userInfo.substring(colon + 1) : "";
                if (dbUser.isBlank()) dbUser = URLDecoder.decode(urlUser, StandardCharsets.UTF_8);
                if (dbPass.isBlank()) dbPass = URLDecoder.decode(urlPass, StandardCharsets.UTF_8);
            }
            int port = uri.getPort();
            String hostPort = uri.getHost() + (port > 0 ? ":" + port : "");
            String path = uri.getPath() == null ? "" : uri.getPath();
            String query = uri.getRawQuery() == null ? "" : "?" + uri.getRawQuery();
            u = "jdbc:" + jdbcScheme + "://" + hostPort + path + query;
        }

        String driver;
        if (u.startsWith("jdbc:postgresql:")) {
            driver = "org.postgresql.Driver";
            if (!u.contains("sslmode=") && !u.contains("//localhost") && !u.contains("//127.0.0.1")) {
                u += (u.contains("?") ? "&" : "?") + "sslmode=require";
            }
        } else if (u.startsWith("jdbc:mysql:")) {
            driver = "com.mysql.cj.jdbc.Driver";
        } else if (u.startsWith("jdbc:h2:")) {
            driver = "org.h2.Driver";
        } else {
            throw new IllegalStateException("Unsupported database URL.");
        }
        return new ConnectionInfo(u, dbUser, dbPass, driver);
    }

    private static String safeUrl(String jdbcUrl) {
        int q = jdbcUrl.indexOf('?');
        return q >= 0 ? jdbcUrl.substring(0, q) : jdbcUrl;
    }

    private static String firstNonBlank(String... values) {
        for (String v : values) if (v != null && !v.isBlank()) return v;
        return "";
    }

    static final class ConnectionInfo {
        final String jdbcUrl, user, password, driver;
        ConnectionInfo(String jdbcUrl, String user, String password, String driver) {
            this.jdbcUrl = jdbcUrl; this.user = user; this.password = password; this.driver = driver;
        }
    }
}
