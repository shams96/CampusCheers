# CampusCheers Proposed Architecture Diagram

```mermaid
graph TD
    %% Frontend Layer
    subgraph "Frontend Layer"
        A[Next.js Frontend] --> B[CloudFront CDN]
        A --> C[Cloudflare CDN]
    end

    %% API Gateway Layer
    subgraph "API Gateway Layer"
        D[AWS API Gateway]
    end

    %% Service Layer
    subgraph "Microservices Layer"
        E[Authentication Service]
        F[User Service]
        G[Hype Service]
        H[Moment Service]
        I[Notification Service]
        J[AI Service]
        K[Analytics Service]
    end

    %% Serverless Functions
    subgraph "Serverless Functions"
        L[Hype Round Generation]
        M[Notification Dispatch]
        N[Image Processing]
        O[Analytics Processing]
    end

    %% Data Layer
    subgraph "Data Layer"
        subgraph "Database Cluster"
            P[(Primary DB - Citus)]
            Q[(Read Replica 1)]
            R[(Read Replica 2)]
        end
        
        subgraph "Cache Layer"
            S[(Redis Cluster)]
        end
        
        subgraph "Storage"
            T[(S3 Bucket - Moments)]
            U[(S3 Bucket - Static Assets)]
        end
    end

    %% External Services
    subgraph "External Services"
        V[OpenAI API]
        W[Twilio SMS]
        X[Google Maps API]
    end

    %% Monitoring & Security
    subgraph "Monitoring & Security"
        Y[WAF & DDoS Protection]
        Z[Monitoring & Logging]
    end

    %% Connections
    B --> D
    C --> D
    D --> E
    D --> F
    D --> G
    D --> H
    D --> I
    D --> J
    D --> K
    
    E --> P
    F --> P
    G --> P
    H --> P
    I --> P
    J --> P
    K --> P
    
    E --> S
    F --> S
    G --> S
    H --> S
    I --> S
    J --> S
    K --> S
    
    G --> L
    I --> M
    H --> N
    K --> O
    
    L --> P
    M --> W
    N --> T
    O --> K
    
    P --> Q
    P --> R
    
    J --> V
    I --> W
    F --> X
    
    D --> Y
    E --> Z
    F --> Z
    G --> Z
    H --> Z
    I --> Z
    J --> Z
    K --> Z
    L --> Z
    M --> Z
    N --> Z
    O --> Z
    
    S --> P
    
    classDef frontend fill:#e1f5fe,stroke:#01579b
    classDef gateway fill:#f3e5f5,stroke:#4a148c
    classDef services fill:#e8f5e8,stroke:#1b5e20
    classDef serverless fill:#fff3e0,stroke:#e65100
    classDef data fill:#fce4ec,stroke:#880e4f
    classDef external fill:#f5f5f5,stroke:#212121
    classDef security fill:#ffebee,stroke:#b71c1c
    
    class A,B,C frontend
    class D gateway
    class E,F,G,H,I,J,K services
    class L,M,N,O serverless
    class P,Q,R,S,T,U data
    class V,W,X external
    class Y,Z security