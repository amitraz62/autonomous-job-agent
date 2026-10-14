package com.bot.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.boot.web.embedded.tomcat.TomcatProtocolHandlerCustomizer;

import java.util.concurrent.Executors;

@Configuration
public class VirtualThreadConfig {

    /**
     * Enables JDK 21 Virtual Threads for all incoming Tomcat requests.
     */
    @Bean
    public TomcatProtocolHandlerCustomizer<?> protocolHandlerVirtualThreadCustomizer() {
        return protocolHandler -> protocolHandler.setExecutor(Executors.newVirtualThreadPerTaskExecutor());
    }
}
