import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // 테스트용 지원사업 데이터 생성
  const grants = await Promise.all([
    prisma.grant.create({
      data: {
        title: "2025년 창업성장기술개발사업 디딤돌 창업과제",
        description:
          "창업 초기 기업의 기술개발을 지원합니다. 혁신적인 아이디어와 기술력을 보유한 스타트업을 발굴하여 성장을 돕습니다.",
        organization: "중소벤처기업부",
        deadline: new Date("2025-02-15"),
        amount: "최대 1억원",
        category: "창업지원",
        status: "open",
        eligibility: "창업 7년 이내 중소기업",
        applicationMethod: "온라인 신청",
        requiredDocuments: ["사업계획서", "사업자등록증", "기술개발계획서"],
        contactInfo: {
          phone: "1357",
          email: "support@mss.go.kr",
          website: "https://www.mss.go.kr",
        },
      },
    }),
    prisma.grant.create({
      data: {
        title: "혁신창업사업화자금 (융자)",
        description: "혁신성장 분야 창업기업에 대한 정책자금 융자 지원",
        organization: "중소벤처기업진흥공단",
        deadline: new Date("2025-01-31"),
        amount: "최대 1억원",
        category: "금융지원",
        status: "open",
        eligibility: "업력 7년 미만 중소기업",
        applicationMethod: "온라인 신청",
        requiredDocuments: ["사업계획서", "재무제표", "사업자등록증"],
        contactInfo: {
          phone: "1588-5302",
          email: "contact@kosmes.or.kr",
          website: "https://www.kosmes.or.kr",
        },
      },
    }),
    prisma.grant.create({
      data: {
        title: "TIPS 프로그램",
        description:
          "기술력이 우수한 스타트업을 발굴하여 집중 육성하는 민간주도 기술창업 지원 프로그램",
        organization: "중소벤처기업부",
        deadline: new Date("2025-03-31"),
        amount: "최대 5억원",
        category: "R&D",
        status: "open",
        eligibility: "창업 7년 이내, 기술력 보유 스타트업",
        applicationMethod: "운영사 추천 및 온라인 신청",
        requiredDocuments: ["사업계획서", "기술설명서", "팀 소개자료"],
        contactInfo: {
          phone: "02-6009-3800",
          email: "tips@tips.or.kr",
          website: "https://www.jointips.or.kr",
        },
      },
    }),
    prisma.grant.create({
      data: {
        title: "청년창업사관학교",
        description: "만 39세 이하 (예비)창업자를 위한 창업 집중 육성 프로그램",
        organization: "중소벤처기업진흥공단",
        deadline: new Date("2025-04-30"),
        amount: "최대 1억원",
        category: "창업지원",
        status: "open",
        eligibility: "만 39세 이하 예비창업자 또는 3년 미만 창업자",
        applicationMethod: "온라인 신청",
        requiredDocuments: ["창업계획서", "신분증", "졸업증명서"],
        contactInfo: {
          phone: "1588-5302",
          email: "startup@kosmes.or.kr",
          website: "https://start.kosmes.or.kr",
        },
      },
    }),
    prisma.grant.create({
      data: {
        title: "소상공인 정책자금",
        description: "소상공인의 경영안정 및 성장을 위한 저금리 정책자금 지원",
        organization: "소상공인시장진흥공단",
        deadline: new Date("2024-12-31"),
        amount: "최대 7천만원",
        category: "금융지원",
        status: "closed",
        eligibility: "상시 근로자 5인 미만 소상공인",
        applicationMethod: "온라인 및 방문 신청",
        requiredDocuments: ["사업자등록증", "매출 증빙", "재무제표"],
        contactInfo: {
          phone: "1588-5302",
          email: "small@semas.or.kr",
          website: "https://www.semas.or.kr",
        },
      },
    }),
  ]);

  console.log(`✅ Created ${grants.length} grants`);

  // 테스트 사용자 생성 (개발 환경용)
  const testUser = await prisma.user.upsert({
    where: { email: "test@example.com" },
    update: {},
    create: {
      email: "test@example.com",
      name: "테스트 사용자",
      profileImage: null,
      googleId: "test-google-id",
      credits: 3,
    },
  });

  console.log(`✅ Created test user: ${testUser.email}`);

  // 테스트 사업계획서 생성
  const businessPlan = await prisma.businessPlan.create({
    data: {
      title: "AI 기반 물류 최적화 플랫폼 사업계획서",
      content: {
        sections: [
          {
            id: "section-1",
            title: "사업 개요",
            content:
              "AI 기술을 활용하여 물류 경로를 최적화하고 비용을 절감하는 플랫폼입니다.",
          },
          {
            id: "section-2",
            title: "시장 분석",
            content:
              "국내 물류 시장 규모는 약 200조원으로, 연평균 5% 성장 중입니다.",
          },
        ],
      },
      status: "completed",
      userId: testUser.id,
      grantId: grants[0]!.id,
    },
  });

  console.log(`✅ Created test business plan: ${businessPlan.title}`);

  // 찜한 지원사업 생성
  await prisma.favoriteGrant.create({
    data: {
      userId: testUser.id,
      grantId: grants[1]!.id,
    },
  });

  console.log("✅ Created test favorite");

  // 이용권 내역 생성
  await prisma.creditHistory.createMany({
    data: [
      {
        userId: testUser.id,
        type: "purchase",
        amount: 5,
        description: "이용권 구매",
      },
      {
        userId: testUser.id,
        type: "use",
        amount: -1,
        description: "사업계획서 생성",
        businessPlanId: businessPlan.id,
      },
      {
        userId: testUser.id,
        type: "use",
        amount: -1,
        description: "사업계획서 생성",
      },
    ],
  });

  console.log("✅ Created credit history");

  console.log("🎉 Seeding completed!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
