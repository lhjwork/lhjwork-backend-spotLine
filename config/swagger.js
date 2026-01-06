const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Spotline API",
      version: "1.0.0",
      description: "QR 기반 로컬 연결 서비스 API 문서",
      contact: {
        name: "Spotline Team",
        email: "contact@spotline.com",
      },
    },
    servers: [
      {
        url: process.env.NODE_ENV === "production" ? "https://lhjwork-backend-spotline.onrender.com" : "http://localhost:4000",
        description: process.env.NODE_ENV === "production" ? "Production server" : "Development server",
      },
    ],
    components: {
      schemas: {
        Store: {
          type: "object",
          required: ["name", "category", "location", "qrCode"],
          properties: {
            _id: {
              type: "string",
              description: "매장 고유 ID",
            },
            name: {
              type: "string",
              description: "매장명",
            },
            category: {
              type: "string",
              enum: ["cafe", "restaurant", "exhibition", "hotel", "retail", "culture", "other"],
              description: "매장 카테고리",
            },
            location: {
              type: "object",
              properties: {
                address: {
                  type: "string",
                  description: "주소",
                },
                coordinates: {
                  type: "object",
                  properties: {
                    type: {
                      type: "string",
                      enum: ["Point"],
                    },
                    coordinates: {
                      type: "array",
                      items: {
                        type: "number",
                      },
                      description: "[경도, 위도]",
                    },
                  },
                },
                district: {
                  type: "string",
                  description: "구/동 정보",
                },
                area: {
                  type: "string",
                  description: "상권 정보",
                },
              },
            },
            qrCode: {
              type: "object",
              properties: {
                id: {
                  type: "string",
                  description: "QR 코드 ID",
                },
                isActive: {
                  type: "boolean",
                  description: "QR 코드 활성화 상태",
                },
              },
            },
            contact: {
              type: "object",
              properties: {
                phone: {
                  type: "string",
                },
                website: {
                  type: "string",
                },
                instagram: {
                  type: "string",
                },
              },
            },
            description: {
              type: "string",
              description: "매장 설명",
            },
            tags: {
              type: "array",
              items: {
                type: "string",
              },
              description: "매장 태그",
            },
            images: {
              type: "array",
              items: {
                type: "string",
              },
              description: "이미지 URL 배열",
            },
            isActive: {
              type: "boolean",
              description: "매장 활성화 상태",
            },
            createdAt: {
              type: "string",
              format: "date-time",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
            },
          },
        },
        Recommendation: {
          type: "object",
          properties: {
            _id: {
              type: "string",
            },
            fromStore: {
              type: "string",
              description: "추천 출발 매장 ID",
            },
            toStore: {
              type: "string",
              description: "추천 대상 매장 ID",
            },
            category: {
              type: "string",
              enum: ["next_meal", "dessert", "activity", "shopping", "culture", "rest"],
              description: "추천 카테고리",
            },
            priority: {
              type: "number",
              minimum: 1,
              maximum: 10,
              description: "우선순위",
            },
            distance: {
              type: "number",
              description: "거리 (미터)",
            },
            walkingTime: {
              type: "number",
              description: "도보 시간 (분)",
            },
            description: {
              type: "string",
              description: "추천 이유",
            },
            tags: {
              type: "array",
              items: {
                type: "string",
              },
            },
          },
        },
        Analytics: {
          type: "object",
          properties: {
            _id: {
              type: "string",
            },
            qrCode: {
              type: "string",
              description: "QR 코드 ID",
            },
            store: {
              type: "string",
              description: "매장 ID",
            },
            eventType: {
              type: "string",
              enum: ["qr_scan", "page_view", "recommendation_click", "map_click", "store_visit"],
              description: "이벤트 타입",
            },
            timestamp: {
              type: "string",
              format: "date-time",
            },
          },
        },
        Error: {
          type: "object",
          properties: {
            error: {
              type: "string",
              description: "에러 메시지",
            },
            status: {
              type: "number",
              description: "HTTP 상태 코드",
            },
          },
        },
      },
    },
  },
  apis: ["./routes/*.js", "./server.js"],
};

const specs = swaggerJsdoc(options);

module.exports = {
  specs,
  swaggerUi,
};
