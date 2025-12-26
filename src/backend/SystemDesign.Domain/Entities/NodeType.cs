namespace SystemDesign.Domain.Entities;

/// <summary>
/// Các loại node hỗ trợ trong system design, phân loại theo 5 nhóm chính
/// </summary>
public enum NodeType
{
    // 1. Entry Points
    User,
    Client,
    IoTDevice,
    MobileApp,
    WebBrowser,
    
    // 2. Traffic Managers
    LoadBalancer,
    APIGateway,
    ReverseProxy,
    ServiceMesh,
    
    // 3. Compute
    WebApi,
    Microservice,
    WorkerService,
    LambdaFunction,
    ContainerService,
    
    // 4. Storage
    SQLServer,
    PostgreSQL,
    MySQL,
    MongoDB,
    CosmosDB,
    DynamoDB,
    BlobStorage,
    S3Storage,
    
    // 5. Middlewares
    Redis,
    Memcached,
    RabbitMQ,
    Kafka,
    AzureServiceBus,
    MessageQueue,
    EventHub,
    CDN
}
