import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const admin = await prisma.user.upsert({
    where: { dingtalkUserId: 'admin' },
    update: {},
    create: {
      dingtalkUserId: 'admin',
      name: '系统管理员',
      role: 'super_admin',
      status: 'active',
    },
  });

  console.log('Created admin user:', admin);

  const shifts = await Promise.all([
    prisma.shift.upsert({
      where: { id: 1 },
      update: {},
      create: {
        id: 1,
        name: '早班',
        startTime: '09:00',
        endTime: '18:00',
        restStartTime: '12:00',
        restEndTime: '13:00',
        color: '#409EFF',
      },
    }),
    prisma.shift.upsert({
      where: { id: 2 },
      update: {},
      create: {
        id: 2,
        name: '中班',
        startTime: '14:00',
        endTime: '23:00',
        restStartTime: '17:00',
        restEndTime: '18:00',
        color: '#67C23A',
      },
    }),
    prisma.shift.upsert({
      where: { id: 3 },
      update: {},
      create: {
        id: 3,
        name: '晚班',
        startTime: '22:00',
        endTime: '07:00',
        color: '#E6A23C',
      },
    }),
  ]);

  console.log('Created shifts:', shifts);

  const group = await prisma.attendanceGroup.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: '默认考勤组',
      description: '系统默认考勤组',
      workDays: '1,2,3,4,5',
      flexTime: false,
      lateGrace: 5,
      earlyGrace: 5,
      maxPatchCard: 3,
    },
  });

  console.log('Created attendance group:', group);

  await prisma.notificationTemplate.upsert({
    where: { code: 'late_reminder' },
    update: {},
    create: {
      code: 'late_reminder',
      name: '迟到提醒',
      title: '上班迟到提醒',
      content: '您今日上班迟到 {minutes} 分钟，请注意考勤纪律。',
    },
  });

  await prisma.notificationTemplate.upsert({
    where: { code: 'missing_checkout' },
    update: {},
    create: {
      code: 'missing_checkout',
      name: '缺卡提醒',
      title: '下班缺卡提醒',
      content: '您今日下班未打卡，请及时补卡或联系管理员。',
    },
  });

  await prisma.notificationTemplate.upsert({
    where: { code: 'approval_result' },
    update: {},
    create: {
      code: 'approval_result',
      name: '审批结果通知',
      title: '审批结果通知',
      content: '您的{type}申请已{result}。',
    },
  });

  console.log('Created notification templates');
  console.log('Database seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });