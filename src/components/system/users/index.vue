<template>
  <div class="users-wrapper">
    <sticky className="tool-bar info">
      <template>
        <el-button type="primary" @click="addUser()">创建用户</el-button>
        <el-button type="success" @click="importUsers()">导入用户</el-button>
      </template>
    </sticky>
    <el-table
      :data="users"
      border
      style="width: 100%">
      <el-table-column
        align="center"
        prop="name"
        label="姓名">
      </el-table-column>
      <el-table-column
        align="center"
        prop="phone"
        label="手机">
      </el-table-column>
      <el-table-column
        align="center"
        :formatter="formatterGender"
        label="性别">
      </el-table-column>
      <el-table-column
        v-if="screenWidth > 1024"
        align="center"
        prop="id_number"
        label="身份证">
      </el-table-column>
      <el-table-column
        v-if="screenWidth > 1440"
        align="center"
        prop="home"
        label="地址">
      </el-table-column>
      <el-table-column
        v-if="screenWidth > 1440"
        align="center"
        prop="created_at"
        label="创建时间">
      </el-table-column>
      <el-table-column align="center" label="操作" width="200">
        <template slot-scope="scope">
          <el-tooltip effect="dark" content="编辑" placement="bottom">
            <el-button type="primary" size="mini" icon="el-icon-edit" @click="editUser(scope.row)"></el-button>
          </el-tooltip>
          <el-tooltip effect="dark" content="分配监测点" placement="bottom">
            <el-button type="success" size="mini" icon="el-icon-location" @click="editSite(scope.row)"></el-button>
          </el-tooltip>
          <el-tooltip effect="dark" content="删除" placement="bottom">
            <el-button type="danger" size="mini" icon="el-icon-delete" @click="removeUser(scope.row)"></el-button>
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog
      top="30vh"
      width="500px"
      title="导入用户"
      :visible.sync="uploadVisible"
      append-to-body>
      <el-upload
        class="upload-demo"
        ref="upload"
        :headers="headers"
        :action="`${baseUrl}/addUserList`"
        :file-list="fileList"
        :auto-upload="false">
        <el-button slot="trigger" size="small" type="primary">选取文件</el-button>
      </el-upload>
      <div slot="footer" class="dialog-footer">
        <el-button @click="uploadVisible = false">取 消</el-button>
        <el-button type="success" @click="submitUpload">上 传</el-button>
      </div>
    </el-dialog>
    <el-dialog
      width="600px"
      title="编辑用户信息"
      :visible.sync="userVisible">
      <el-form :model="user" :rules="rules" label-width="65px" ref="editForm" style="margin: 0 60px">
        <el-form-item label="用户名" prop="email" :error="error.email">
          <el-input v-model="user.email" maxlength="16"></el-input>
        </el-form-item>
        <el-form-item v-if="user.id" label="密码" :key="1">
          <el-input v-model="user.password"></el-input>
        </el-form-item>
        <el-form-item v-else label="密码" prop="password" :key="2">
          <el-input v-model="user.password"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="phone" :error="error.phone">
          <el-input v-model="user.phone"></el-input>
        </el-form-item>
        <el-form-item label="姓名" prop="name" :error="error.name">
          <el-input v-model="user.name"></el-input>
        </el-form-item>
        <el-form-item label="性别">
          <el-radio-group v-model="user.gender">
            <el-radio :label="1">男</el-radio>
            <el-radio :label="0">女</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="身份证" prop="id_number">
          <el-input v-model="user.id_number"></el-input>
        </el-form-item>
        <el-form-item label="地址">
          <el-input v-model="user.home"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="userVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitUserForm">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog
      width="900px"
      :title="userSiteTitle"
      :visible.sync="siteVisible"
      append-to-body>
      <site :user="user" ref="site"></site>
      <div slot="footer" class="dialog-footer">
        <el-button @click="siteVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveSiteManager">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog
      top="30vh"
      width="400px"
      title="操作提示"
      :visible.sync="removeVisible"
      append-to-body>
      <div>{{removeMessage}}</div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="removeVisible = false">取 消</el-button>
        <el-button type="primary" @click="confirmRemove">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script type="text/ecmascript-6">
import Sticky from 'base/sticky'
import Site from './site'
import {mapGetters} from 'vuex'
import {debounce} from 'common/utils'
import { getToken } from 'common/utils/auth'
import {listUsers, addUser, updateUser, deleteUser} from 'api/users'
export default {
  data() {
    const validateEmail = (rule, value, callback) => {
      let reg = /^[a-zA-Z0-9_-]{4,16}$/
      if (!value) {
        callback(new Error('用户名为必填项'))
      } else if (!reg.test(value)) {
        callback(new Error('用户名由4到16位字母、数字、下划线、减号组成'))
      } else {
        callback()
      }
    }
    const validatePhone = (rule, value, callback) => {
      let reg = /^[1][3,4,5,7,8][0-9]{9}$/
      if (!value) {
        callback(new Error('手机号码为必填项'))
      } else if (!reg.test(value)) {
        callback(new Error('手机号码格式错误'))
      } else {
        callback()
      }
    }
    const validateIDCard = (rule, value, callback) => {
      console.log(value)
      let reg = /^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}([0-9]|X)$/
      if (value && !reg.test(value)) {
        callback(new Error('身份证号格式错误'))
      } else {
        callback()
      }
    }
    return {
      baseUrl: process.env.BASE_API,
      headers: {
        Authorization: getToken()
      },
      screenWidth: 0,
      uploadVisible: false,
      userVisible: false,
      siteVisible: false,
      removeVisible: false,
      users: [],
      user: {},
      rules: {
        email: [{required: true, trigger: 'blur', validator: validateEmail}],
        password: [{required: true, message: '密码为必填项', trigger: 'blur'}],
        phone: [{required: true, trigger: 'blur', validator: validatePhone}],
        name: [{required: true, message: '姓名为必填项', trigger: 'blur'}],
        id_number: [{trigger: 'blur', validator: validateIDCard}]
      },
      error: {
        email: '',
        phone: '',
        name: ''
      },
      fileList: []
    }
  },
  computed: {
    ...mapGetters([
      'me'
    ]),
    removeMessage() {
      return `您确定要删除用户 ${this.user.name} 吗？`
    },
    userSiteTitle() {
      return `监测点分配 - ${this.user.name}`
    }
  },
  mounted() {
    this.getUsers()
    this.screenWidth = window.innerWidth
    this.__resizeHanlder = debounce(() => {
      this.screenWidth = window.innerWidth
    }, 100)
    window.addEventListener('resize', this.__resizeHanlder)
  },
  methods: {
    importUsers() {
      this.uploadVisible = true
    },
    addUser() {
      this.user = {}
      this.userVisible = true
      try { this.$refs.editForm.resetFields() } catch (e) {}
    },
    editUser(user) {
      this.user = user
      this.userVisible = true
      try { this.$refs.editForm.clearValidate() } catch (e) {}
    },
    submitUserForm() {
      this.$refs.editForm.validate(valid => {
        if (valid) {
          if (this.user.id) {
            updateUser(this.user).then(res => {
              if (res.email) {
                this.error.email = res.email[0]
              }
              if (res.name) {
                this.error.name = res.name[0]
              }
              if (res.phone) {
                this.error.phone = res.phone[0]
              }
              if (res.message) {
                this.userVisible = false
                this.$message({
                  message: '修改用户成功',
                  type: 'success'
                })
                this.getUsers()
              }
            })
          } else {
            this.user.project_id = this.me.project_id
            this.error = {email: '', phone: '', name: ''}
            addUser(this.user).then(res => {
              if (res.email) {
                this.error.email = res.email[0]
              }
              if (res.name) {
                this.error.name = res.name[0]
              }
              if (res.phone) {
                this.error.phone = res.phone[0]
              }
              if (res.id) {
                this.userVisible = false
                this.$message({
                  message: '创建用户成功',
                  type: 'success'
                })
                this.getUsers()
              }
            })
          }
        } else {
          return false
        }
      })
    },
    editSite(user) {
      this.user = user
      this.siteVisible = true
    },
    saveSiteManager() {
      if (this.$refs.site.save()) {
        this.siteVisible = false
        this.$message({
          message: '操作成功',
          type: 'success'
        })
      } else {
        this.$message({
          message: '操作失败',
          type: 'warning'
        })
      }
    },
    removeUser(user) {
      this.user = user
      this.removeVisible = true
    },
    confirmRemove() {
      deleteUser(this.user).then(res => {
        if (res) {
          this.removeVisible = false
          this.$message({
            message: '操作成功',
            type: 'success'
          })
          this.getUsers()
        } else {
          this.$message({
            message: '操作失败',
            type: 'warning'
          })
        }
      })
    },
    submitUpload() {
      this.$refs.upload.submit()
    },
    formatterGender(row) {
      return row.gender === 1 ? '男' : '女'
    },
    getUsers() {
      listUsers().then(res => {
        this.users = res
      })
    }
  },
  components: {
    Sticky,
    Site
  }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">

</style>
