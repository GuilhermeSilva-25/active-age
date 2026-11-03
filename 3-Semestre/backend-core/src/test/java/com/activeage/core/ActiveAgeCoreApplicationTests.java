package com.activeage.core;

import com.activeage.core.config.DataInitializer;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

@SpringBootTest(properties = {
        "activeage.seeding.enabled=false",
        "spring.data.mongodb.uri=mongodb://localhost:27017/active_age_test"
})
class ActiveAgeCoreApplicationTests {

    @MockitoBean
    private DataInitializer dataInitializer;

    @Test
    void contextLoads() {
    }

}
