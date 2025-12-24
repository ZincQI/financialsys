# 虚拟环境使用指南

## 什么是虚拟环境？
虚拟环境是一个隔离的Python环境，允许您为不同的项目安装不同版本的依赖，而不会相互干扰。

## 为什么使用虚拟环境？
- 避免依赖冲突
- 确保项目的依赖版本一致
- 便于项目的部署和迁移
- 可以使用与生产环境相同的Python版本

## 如何使用虚拟环境运行项目？

### 1. 安装虚拟环境（如果尚未安装）
```bash
python -m venv venv
```

### 2. 激活虚拟环境
```bash
# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

### 3. 安装项目依赖
```bash
pip install -r requirements.txt
```

### 4. 运行项目
```bash
python run.py
```

### 5. 退出虚拟环境
```bash
deactivate
```

## 如何在IDE中使用虚拟环境？

### PyCharm
1. 打开项目
2. 点击 `File` > `Settings` > `Project` > `Python Interpreter`
3. 点击右上角的齿轮图标，选择 `Add...`
4. 选择 `Existing environment`，然后浏览到项目目录下的 `venv\Scripts\python.exe`
5. 点击 `OK` 保存设置

### Visual Studio Code
1. 打开项目
2. 点击左下角的Python版本号
3. 在弹出的列表中选择项目目录下的 `venv\Scripts\python.exe`
4. 等待VS Code配置完成

## 注意事项

1. 确保每次运行项目前都激活了虚拟环境
2. 不要将虚拟环境目录 `venv` 提交到版本控制系统
3. 如果依赖发生变化，需要重新运行 `pip install -r requirements.txt`
4. 使用 `venv\Scripts\python.exe` 而不是全局的 `python` 命令，可以确保使用虚拟环境的Python版本

## 常用命令

```bash
# 创建虚拟环境
python -m venv venv

# 激活虚拟环境
venv\Scripts\activate

# 安装依赖
pip install -r requirements.txt

# 运行项目
python run.py

# 运行测试
python -m pytest

# 生成依赖列表
pip freeze > requirements.txt

# 退出虚拟环境
deactivate
```
