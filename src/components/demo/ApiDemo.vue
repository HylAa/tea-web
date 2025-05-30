<template>
  <div class="api-demo">
    <h2>API 调用示例</h2>

    <div class="demo-section">
      <h3>用户登录</h3>
      <n-form
        :model="loginForm"
        ref="loginFormRef"
        label-placement="left"
        label-width="80"
      >
        <n-form-item label="用户名" path="username">
          <n-input
            v-model:value="loginForm.username"
            placeholder="请输入用户名"
          />
        </n-form-item>
        <n-form-item label="密码" path="password">
          <n-input
            v-model:value="loginForm.password"
            type="password"
            placeholder="请输入密码"
          />
        </n-form-item>
        <n-form-item>
          <n-button type="primary" @click="handleLogin">登录</n-button>
        </n-form-item>
      </n-form>
    </div>

    <div class="demo-section">
      <h3>获取用户列表</h3>
      <n-button type="info" @click="handleGetUserList">获取用户列表</n-button>

      <div v-if="userList.length > 0" class="result-section">
        <h4>结果：</h4>
        <n-table :bordered="false" :single-line="false">
          <thead>
            <tr>
              <th>ID</th>
              <th>用户名</th>
              <th>邮箱</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in userList" :key="user.id">
              <td>{{ user.id }}</td>
              <td>{{ user.username }}</td>
              <td>{{ user.email }}</td>
            </tr>
          </tbody>
        </n-table>
      </div>
    </div>

    <div class="demo-section">
      <h3>API 请求状态</h3>
      <div class="status-section">
        <p><strong>状态：</strong> {{ loading ? "加载中..." : "空闲" }}</p>
        <p v-if="error"><strong>错误：</strong> {{ error }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import {
  NForm,
  NFormItem,
  NInput,
  NButton,
  NTable,
  useMessage,
} from "naive-ui";
import { userApi } from "../../api";

defineOptions({
  name: "ApiDemo",
});

const message = useMessage();
const loading = ref(false);
const error = ref("");

// 登录表单
const loginForm = ref({
  username: "",
  password: "",
});

// 用户列表
const userList = ref<any[]>([]);

// 模拟用户数据（实际项目中应该从 API 获取）
const mockUsers = [
  { id: 1, username: "user1", email: "user1@example.com" },
  { id: 2, username: "user2", email: "user2@example.com" },
  { id: 3, username: "user3", email: "user3@example.com" },
];

// 处理登录
const handleLogin = async () => {
  if (!loginForm.value.username || !loginForm.value.password) {
    message.warning("请输入用户名和密码");
    return;
  }

  loading.value = true;
  error.value = "";

  try {
    // 实际项目中应该调用真实 API
    // const res = await userApi.login(loginForm.value);

    // 模拟 API 调用
    await new Promise((resolve) => setTimeout(resolve, 1000));

    message.success("登录成功");
    console.log("登录成功，用户名：", loginForm.value.username);
  } catch (err: any) {
    error.value = err.message || "登录失败";
    message.error(error.value);
  } finally {
    loading.value = false;
  }
};

// 获取用户列表
const handleGetUserList = async () => {
  loading.value = true;
  error.value = "";

  try {
    // 实际项目中应该调用真实 API
    // const res = await userApi.getUserList();

    // 模拟 API 调用
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // 使用模拟数据
    userList.value = mockUsers;

    message.success("获取用户列表成功");
  } catch (err: any) {
    error.value = err.message || "获取用户列表失败";
    message.error(error.value);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.api-demo {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.demo-section {
  margin-bottom: 30px;
  padding: 20px;
  border-radius: 8px;
  background-color: #f9f9f9;
}

.result-section {
  margin-top: 20px;
  padding: 15px;
  border-radius: 6px;
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.status-section {
  padding: 15px;
  border-radius: 6px;
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

h2 {
  margin-bottom: 24px;
  color: #333;
}

h3 {
  margin-bottom: 16px;
  color: #555;
}

h4 {
  margin-bottom: 12px;
  color: #666;
}
</style>
