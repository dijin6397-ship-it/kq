# 智勤考勤 — 接口文档

## 一、认证接口

### 1.1 免登登录
```
POST /api/auth/login
Content-Type: application/json

Body:
{
  "authCode": "string"  // 钉钉授权码
}

Response 200:
{
  "code": 200,
  "message": "success",
  "data": {
    "token": "jwt_token_string",
    "user": {
      "id": 1,
      "name": "张三",
      "avatar": "https://...",
      "role": "employee",
      "departmentId": 100,
      "departmentName": "技术部"
    }
  }
}
```

### 1.2 获取当前用户信息
```
GET /api/auth/profile
Authorization: Bearer <token>

Response 200:
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "name": "张三",
    "avatar": "https://...",
    "mobile": "13800138000",
    "email": "zhangsan@company.com",
    "role": "employee",
    "departmentId": 100,
    "departmentName": "技术部",
    "hireDate": "2024-01-01"
  }
}
```

---

## 二、考勤接口

### 2.1 获取今日打卡状态
```
GET /api/attendance/today
Authorization: Bearer <token>

Response 200:
{
  "code": 200,
  "message": "success",
  "data": {
    "date": "2024-01-15",
    "checkInTime": "2024-01-15T09:01:00Z",
    "checkOutTime": "2024-01-15T18:30:00Z",
    "checkInResult": "Normal",
    "checkOutResult": "Normal",
    "timeResult": "Normal",
    "locationResult": "Normal",
    "isLate": false,
    "isEarlyLeave": false,
    "isAbsent": false,
    "lateMinutes": 0,
    "earlyMinutes": 0
  }
}
```

### 2.2 获取今日详情（含位置校验）
```
GET /api/attendance/today/detail
Authorization: Bearer <token>

Response 200:
{
  "code": 200,
  "message": "success",
  "data": {
    "record": { ... },
    "schedule": {
      "id": 1,
      "workDate": "2024-01-15",
      "shift": {
        "name": "早班",
        "startTime": "09:00",
        "endTime": "18:00"
      }
    },
    "fieldWork": null
  }
}
```

---

## 三、考勤日历

### 3.1 获取考勤日历
```
GET /api/calendar?year=2024&month=1
Authorization: Bearer <token>

Response 200:
{
  "code": 200,
  "message": "success",
  "data": {
    "year": 2024,
    "month": 1,
    "days": [
      {
        "date": "2024-01-15",
        "status": "normal",  // normal|late|early_leave|absent|leave|overtime|field_work|weekend|holiday
        "checkInTime": "2024-01-15T09:01:00Z",
        "checkOutTime": "2024-01-15T18:30:00Z",
        "shiftName": "早班",
        "remark": null
      },
      ...
    ]
  }
}
```

---

## 四、审批接口

### 4.1 发起请假
```
POST /api/approval/leave
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "leaveType": "annual",  // annual|sick|personal|marriage|maternity|paternity|bereavement|compensatory|other
  "startDate": "2024-01-20",
  "endDate": "2024-01-21",
  "startTimePeriod": "am",
  "endTimePeriod": "pm",
  "durationDays": 2,
  "reason": "个人事务"
}

Response 200:
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "approvalInstanceId": "xxx-xxx-xxx"
  }
}
```

### 4.2 发起加班
```
POST /api/approval/overtime
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "overtimeDate": "2024-01-20",
  "startTime": "2024-01-20T18:00:00Z",
  "endTime": "2024-01-20T21:00:00Z",
  "durationHours": 3,
  "dayType": "workday",  // workday|weekend|holiday
  "reason": "项目紧急"
}
```

### 4.3 发起补卡
```
POST /api/approval/patch-card
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "patchDate": "2024-01-15",
  "patchType": "check_in",  // check_in|check_out
  "targetTime": "2024-01-15T09:00:00Z",
  "reason": "忘记打卡"
}
```

### 4.4 发起出差
```
POST /api/approval/business-trip
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "startDate": "2024-01-22",
  "endDate": "2024-01-24",
  "destination": "北京",
  "reason": "客户拜访"
}
```

### 4.5 我的申请列表
```
GET /api/approval/list?type=leave&status=pending&page=1&size=20
Authorization: Bearer <token>

Response 200:
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 1,
      "leaveType": "annual",
      "startDate": "2024-01-20",
      "endDate": "2024-01-21",
      "durationDays": 2,
      "status": "pending",
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ]
}
```

### 4.6 审批详情
```
GET /api/approval/leave/1
Authorization: Bearer <token>

Response 200:
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "leaveType": "annual",
    "startDate": "2024-01-20",
    "endDate": "2024-01-21",
    "startTimePeriod": "am",
    "endTimePeriod": "pm",
    "durationDays": 2,
    "reason": "个人事务",
    "status": "pending",
    "approvalInstanceId": "xxx-xxx-xxx",
    "createdAt": "2024-01-15T10:00:00Z"
  }
}
```

### 4.7 钉钉审批回调
```
POST /api/approval/callback
Headers:
  x-acs-dingtalk-event-timestamp: timestamp
  x-acs-dingtalk-event-nonce: nonce
  x-acs-dingtalk-event-signature: signature
Content-Type: application/json

Body:
{
  "processInstanceId": "xxx-xxx-xxx",
  "type": "start",
  "result": "agree"  // agree|reject
}

Response: 200 (快速响应)
```

---

## 五、外勤签到

### 5.1 签到
```
POST /api/field-work/checkin
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "latitude": 39.9042,
  "longitude": 116.4074,
  "address": "北京市朝阳区xxx",
  "photoUrl": "https://...",
  "remark": "客户现场",
  "workDate": "2024-01-15"
}

Response 200:
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "checkInTime": "2024-01-15T14:00:00Z"
  }
}
```

### 5.2 签到列表
```
GET /api/field-work/list?date=2024-01-15
Authorization: Bearer <token>

Response 200:
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 1,
      "checkInTime": "2024-01-15T14:00:00Z",
      "latitude": 39.9042,
      "longitude": 116.4074,
      "address": "北京市朝阳区xxx",
      "remark": "客户现场"
    }
  ]
}
```

---

## 六、排班接口

### 6.1 我的排班
```
GET /api/schedule/my?year=2024&month=1
Authorization: Bearer <token>

Response 200:
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 1,
      "workDate": "2024-01-15",
      "isHoliday": false,
      "shift": {
        "id": 1,
        "name": "早班",
        "startTime": "09:00",
        "endTime": "18:00"
      }
    }
  ]
}
```

### 6.2 班次列表
```
GET /api/schedule/shifts
Authorization: Bearer <token>

Response 200:
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 1,
      "name": "早班",
      "startTime": "09:00",
      "endTime": "18:00",
      "restStartTime": "12:00",
      "restEndTime": "13:00",
      "color": "#409EFF"
    }
  ]
}
```

### 6.3 考勤组列表
```
GET /api/schedule/groups
Authorization: Bearer <token>

Response 200:
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 1,
      "name": "技术部考勤组",
      "workDays": "1,2,3,4,5",
      "flexTime": false,
      "lateGrace": 5,
      "earlyGrace": 5,
      "maxPatchCard": 3,
      "locations": [
        {
          "id": 1,
          "name": "公司总部",
          "address": "北京市朝阳区xxx",
          "latitude": 39.9042,
          "longitude": 116.4074,
          "radius": 300
        }
      ],
      "shifts": [
        { "id": 1, "name": "早班", "sortOrder": 0 }
      ]
    }
  ]
}
```

---

## 七、统计接口

### 7.1 个人月度统计
```
GET /api/statistics/personal?year=2024&month=1
Authorization: Bearer <token>

Response 200:
{
  "code": 200,
  "message": "success",
  "data": {
    "year": 2024,
    "month": 1,
    "shouldAttend": 22,
    "actualAttend": 20,
    "lateDays": 1,
    "earlyLeaveDays": 0,
    "absentDays": 0,
    "leaveDays": 2,
    "overtimeHours": 8,
    "overtimeDays": 1
  }
}
```

### 7.2 部门统计
```
GET /api/statistics/department?deptId=100&year=2024&month=1
Authorization: Bearer <token>

Response 200:
{
  "code": 200,
  "message": "success",
  "data": {
    "departmentId": 100,
    "memberCount": 10,
    "records": [
      {
        "userId": 1,
        "name": "张三",
        "lateDays": 1,
        "earlyLeaveDays": 0,
        "absentDays": 0
      }
    ]
  }
}
```

---

## 八、消息通知

### 8.1 获取未读通知
```
GET /api/notification/unread
Authorization: Bearer <token>

Response 200:
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 1,
      "type": "late",
      "title": "上班迟到提醒",
      "content": "您今日上班迟到 5 分钟...",
      "isRead": false,
      "createdAt": "2024-01-15T09:05:00Z"
    }
  ]
}
```

### 8.2 标记已读
```
POST /api/notification/read/1
Authorization: Bearer <token>

Response 200:
{
  "code": 200,
  "message": "success",
  "data": { "count": 1 }
}
```

---

## 九、管理后台接口

### 9.1 仪表盘
```
GET /api/admin/dashboard
Authorization: Bearer <token>

Response 200:
{
  "code": 200,
  "message": "success",
  "data": {
    "totalUsers": 100,
    "todayCheckIn": 85,
    "pendingApprovals": 5,
    "lateToday": 3
  }
}
```

### 9.2 考勤记录查询
```
GET /api/admin/records?userId=1&startDate=2024-01-01&endDate=2024-01-31&page=1&size=50
Authorization: Bearer <token>

Response 200:
{
  "code": 200,
  "message": "success",
  "data": {
    "records": [...],
    "total": 100,
    "page": 1,
    "size": 50
  }
}
```

### 9.3 手动修正记录
```
POST /api/admin/records/1/correct
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "checkInTime": "2024-01-15T09:00:00Z",
  "checkOutTime": "2024-01-15T18:00:00Z",
  "isLate": false,
  "lateMinutes": 0
}
```

### 9.4 用户列表
```
GET /api/admin/users?departmentId=100&status=active
Authorization: Bearer <token>

Response 200:
{
  "code": 200,
  "message": "success",
  "data": [...]
}
```

### 9.5 更新用户
```
PUT /api/admin/users/1
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "role": "department_manager",
  "departmentId": 100,
  "departmentName": "技术部",
  "status": "active"
}
```

---

## 十、数据导出

### 10.1 导出考勤报表
```
GET /api/export?startDate=2024-01-01&endDate=2024-01-31&userId=1&format=xlsx
Authorization: Bearer <token>

Response: 文件流
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
Content-Disposition: attachment; filename=attendance_export.xlsx
```

---

## 十一、枚举值

### 11.1 请假类型 (LeaveType)
| 值 | 说明 |
|---|---|
| annual | 年假 |
| sick | 病假 |
| personal | 事假 |
| marriage | 婚假 |
| maternity | 产假 |
| paternity | 陪产假 |
| bereavement | 丧假 |
| compensatory | 调休假 |
| other | 其他 |

### 11.2 加班日期类型 (OvertimeDayType)
| 值 | 说明 |
|---|---|
| workday | 工作日加班 |
| weekend | 休息日加班 |
| holiday | 节假日加班 |

### 11.3 审批状态 (ApprovalStatus)
| 值 | 说明 |
|---|---|
| pending | 待审批 |
| approved | 已通过 |
| rejected | 已拒绝 |
| withdrawn | 已撤回 |

### 11.4 用户角色 (UserRole)
| 值 | 说明 |
|---|---|
| super_admin | 超级管理员 |
| admin | 管理员 |
| department_manager | 部门负责人 |
| employee | 普通员工 |

### 11.5 考勤状态 (AttendanceStatus)
| 值 | 说明 |
|---|---|
| normal | 正常 |
| late | 迟到 |
| early_leave | 早退 |
| absent | 缺勤 |
| leave | 请假 |
| overtime | 加班 |
| field_work | 外勤 |
| weekend | 周末 |
| holiday | 节假日 |

---

## 十二、错误码

| code | 说明 |
|------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未授权 / 签名验证失败 |
| 403 | 权限不足 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |