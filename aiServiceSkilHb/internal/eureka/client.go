package eureka

import (
	"fmt"
	"log"
	"net/url"
	"time"

	"github.com/hudl/fargo"
)

type EurekaClient struct {
	conn   fargo.EurekaConnection
	config *Config
}

type Config struct {
	ServiceURL string
	Username   string
	Password   string
	AppName    string
	Port       int
	InstanceID string
	IPAddress  string
}

func NewEurekaClient(config *Config) *EurekaClient {
	log.Printf("Initializing Eureka client with config: %+v", config)

	// Add authentication to URL if credentials are provided
	serviceURL := config.ServiceURL
	if config.Username != "" && config.Password != "" {
		// Parse URL to add auth
		parsedURL, err := url.Parse(serviceURL)
		if err == nil {
			// Add basic auth to URL
			parsedURL.User = url.UserPassword(config.Username, config.Password)
			serviceURL = parsedURL.String()
			log.Printf("Using authenticated Eureka URL: %s", serviceURL)
		} else {
			log.Printf("Failed to parse Eureka service URL: %v", err)
		}
	}

	conn := fargo.NewConn(serviceURL)
	conn.Timeout = 10 * time.Second

	return &EurekaClient{
		conn:   conn,
		config: config,
	}
}

func (c *EurekaClient) Register() error {
	log.Printf("Attempting to register with Eureka server at %s", c.config.ServiceURL)

	// Xây dựng các URL cần thiết
	ipAddr := c.config.IPAddress
	if ipAddr == "" {
		ipAddr = "localhost"
	}

	port := c.config.Port
	homePageUrl := fmt.Sprintf("http://%s:%d/", ipAddr, port)
	statusPageUrl := fmt.Sprintf("http://%s:%d/health", ipAddr, port)
	healthCheckUrl := fmt.Sprintf("http://%s:%d/health", ipAddr, port)

	// Tạo VipAddress từ tên ứng dụng (chữ thường)
	vipAddress := "ai-service"

	instance := &fargo.Instance{
		HostName:          c.config.IPAddress,
		App:               c.config.AppName,
		IPAddr:            c.config.IPAddress,
		Port:              c.config.Port,
		PortEnabled:       true,
		SecurePort:        443,
		SecurePortEnabled: false,
		CountryId:         1,
		InstanceId:        c.config.InstanceID,
		DataCenterInfo: fargo.DataCenterInfo{
			Name:     "MyOwn",
			Class:    "com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo",
			Metadata: fargo.AmazonMetadataType{},
		},
		LeaseInfo: fargo.LeaseInfo{
			RenewalIntervalInSecs: 30,
			DurationInSecs:        90,
		},
		Status:           fargo.UP,
		VipAddress:       vipAddress,     // Thêm VipAddress (chữ thường)
		SecureVipAddress: vipAddress,     // Thêm SecureVipAddress (chữ thường)
		HomePageUrl:      homePageUrl,    // URL trang chủ
		StatusPageUrl:    statusPageUrl,  // URL trạng thái
		HealthCheckUrl:   healthCheckUrl, // URL kiểm tra sức khỏe
	}

	err := c.conn.RegisterInstance(instance)
	if err != nil {
		log.Printf("❌ Failed to register with Eureka: %v", err)
		return fmt.Errorf("failed to register with Eureka: %v", err)
	}

	log.Printf("✅ Successfully registered with Eureka as %s", c.config.InstanceID)
	log.Printf("Service details:")
	log.Printf("  - App Name: %s", c.config.AppName)
	log.Printf("  - Instance ID: %s", c.config.InstanceID)
	log.Printf("  - IP Address: %s", c.config.IPAddress)
	log.Printf("  - Port: %d", c.config.Port)
	log.Printf("  - VipAddress: %s", vipAddress)
	log.Printf("  - HomePageUrl: %s", homePageUrl)
	return nil
}

func (c *EurekaClient) StartHeartbeat() {
	ticker := time.NewTicker(30 * time.Second)
	go func() {
		for range ticker.C {
			ipAddr := c.config.IPAddress
			if ipAddr == "" {
				ipAddr = "localhost"
			}

			port := c.config.Port
			homePageUrl := fmt.Sprintf("http://%s:%d/", ipAddr, port)
			statusPageUrl := fmt.Sprintf("http://%s:%d/health", ipAddr, port)
			healthCheckUrl := fmt.Sprintf("http://%s:%d/health", ipAddr, port)

			vipAddress := "ai-service"

			instance := &fargo.Instance{
				App:              c.config.AppName,
				InstanceId:       c.config.InstanceID,
				HostName:         c.config.IPAddress,
				IPAddr:           c.config.IPAddress,
				Port:             c.config.Port,
				PortEnabled:      true,
				Status:           fargo.UP,
				VipAddress:       vipAddress,
				SecureVipAddress: vipAddress,
				HomePageUrl:      homePageUrl,
				StatusPageUrl:    statusPageUrl,
				HealthCheckUrl:   healthCheckUrl,
			}

			err := c.conn.HeartBeatInstance(instance)
			if err != nil {
				log.Printf("⚠️ Failed to send heartbeat: %v", err)
			}
		}
	}()
}

func (c *EurekaClient) Deregister() error {
	log.Printf("Attempting to deregister from Eureka server")

	// Chuẩn bị Instance với đầy đủ thông tin để hủy đăng ký
	instance := &fargo.Instance{
		App:        c.config.AppName,
		InstanceId: c.config.InstanceID,
		// Đảm bảo các thông tin khác cũng nhất quán
		HostName:    c.config.IPAddress,
		IPAddr:      c.config.IPAddress,
		Port:        c.config.Port,
		PortEnabled: true,
		Status:      fargo.UP,
	}

	log.Printf("Deregistering instance with url %s/apps/%s/%s", c.config.ServiceURL, c.config.AppName, c.config.InstanceID)

	err := c.conn.DeregisterInstance(instance)
	if err != nil {
		log.Printf("❌ Failed to deregister from Eureka: %v", err)
		return fmt.Errorf("failed to deregister from Eureka: %v", err)
	}
	log.Printf("✅ Successfully deregistered from Eureka")
	return nil
}
