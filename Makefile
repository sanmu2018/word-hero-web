# Word Hero Web Makefile
# 用于构建和管理 Docker 镜像

# 变量定义
APP_NAME :=word-hero-web
VERSION :=0.0.1
DOCKER_REGISTRY :=docker.io
DOCKER_USERNAME :=sanmu2018
IMAGE_NAME :=$(DOCKER_USERNAME)/$(APP_NAME)
IMAGE_TAG :=$(VERSION)

# 颜色输出
RED := \033[0;31m
GREEN := \033[0;32m
YELLOW := \033[0;33m
BLUE := \033[0;34m
NC := \033[0m # No Color

# 默认目标
.PHONY: help
help:
	@echo "$(BLUE)Word Hero Web Docker 管理脚本$(NC)"
	@echo ""
	@echo "$(GREEN)可用命令:$(NC)"
	@echo "  $(YELLOW)build$(NC)       构建 Docker 镜像"
	@echo "  $(YELLOW)push$(NC)        推送镜像到 Docker Hub"
	@echo "  $(YELLOW)run$(NC)         运行容器"
	@echo "  $(YELLOW)stop$(NC)        停止容器"
	@echo "  $(YELLOW)clean$(NC)       清理构建缓存"
	@echo "  $(YELLOW)logs$(NC)        查看容器日志"
	@echo "  $(YELLOW)shell$(NC)       进入容器 shell"
	@echo "  $(YELLOW)tag-latest$(NC)  标记镜像为最新版本"
	@echo "  $(YELLOW)show-info$(NC)   显示镜像信息"
	@echo ""
	@echo "$(GREEN)Docker Compose 命令:$(NC)"
	@echo "  $(YELLOW)up$(NC)          启动服务 (docker compose up)"
	@echo "  $(YELLOW)down$(NC)        停止服务 (docker compose down)"
	@echo "  $(YELLOW)restart$(NC)     重启服务"
	@echo "  $(YELLOW)ps$(NC)          查看服务状态"

# 构建 Docker 镜像
.PHONY: build
build:
	@echo "$(BLUE)正在构建 Docker 镜像...$(NC)"
	docker build -t $(IMAGE_NAME):$(IMAGE_TAG) .
	@echo "$(GREEN)镜像构建完成: $(IMAGE_NAME):$(IMAGE_TAG)$(NC)"

# 推送镜像到 Docker Hub
.PHONY: push
push:
	@echo "$(BLUE)正在推送镜像到 Docker Hub...$(NC)"
	docker push $(IMAGE_NAME):$(IMAGE_TAG)
	@echo "$(GREEN)镜像推送完成: $(IMAGE_NAME):$(IMAGE_TAG)$(NC)"

# 运行容器
.PHONY: run
run:
	@echo "$(BLUE)正在启动容器...$(NC)"
	docker run -d \
		--name $(APP_NAME) \
		-p 3000:80 \
		--restart unless-stopped \
		$(IMAGE_NAME):$(IMAGE_TAG)
	@echo "$(GREEN)容器启动完成，访问: http://localhost:3000$(NC)"

# 停止容器
.PHONY: stop
stop:
	@echo "$(BLUE)正在停止容器...$(NC)"
	docker stop $(APP_NAME) || true
	docker rm $(APP_NAME) || true
	@echo "$(GREEN)容器已停止$(NC)"

# 清理构建缓存
.PHONY: clean
clean:
	@echo "$(BLUE)正在清理构建缓存...$(NC)"
	docker system prune -f
	@echo "$(GREEN)构建缓存已清理$(NC)"

# 查看容器日志
.PHONY: logs
logs:
	@echo "$(BLUE)容器日志:$(NC)"
	docker logs -f $(APP_NAME) 2>/dev/null || echo "$(YELLOW)容器未运行$(NC)"

# 进入容器 shell
.PHONY: shell
shell:
	@echo "$(BLUE)进入容器 shell...$(NC)"
	docker exec -it $(APP_NAME) /bin/sh 2>/dev/null || echo "$(YELLOW)容器未运行$(NC)"

# 标记镜像为最新版本
.PHONY: tag-latest
tag-latest:
	@echo "$(BLUE)正在标记镜像为最新版本...$(NC)"
	docker tag $(IMAGE_NAME):$(IMAGE_TAG) $(IMAGE_NAME):latest
	@echo "$(GREEN)标记完成: $(IMAGE_NAME):latest$(NC)"

# 显示镜像信息
.PHONY: show-info
show-info:
	@echo "$(BLUE)镜像信息:$(NC)"
	docker images $(IMAGE_NAME):$(IMAGE_TAG) 2>/dev/null || echo "$(YELLOW)镜像不存在$(NC)"

# Docker Compose 启动服务
.PHONY: up
up:
	@echo "$(BLUE)正在启动服务...$(NC)"
	docker compose up -d
	@echo "$(GREEN)服务启动完成$(NC)"

# Docker Compose 停止服务
.PHONY: down
down:
	@echo "$(BLUE)正在停止服务...$(NC)"
	docker compose down
	@echo "$(GREEN)服务已停止$(NC)"

# Docker Compose 重启服务
.PHONY: restart
restart:
	@echo "$(BLUE)正在重启服务...$(NC)"
	docker compose restart
	@echo "$(GREEN)服务已重启$(NC)"

# Docker Compose 查看服务状态
.PHONY: ps
ps:
	@echo "$(BLUE)服务状态:$(NC)"
	docker compose ps

# 查看实时日志
.PHONY: logs-compose
logs-compose:
	@echo "$(BLUE)服务日志:$(NC)"
	docker compose logs -f

# 开发模式 (热重载)
.PHONY: dev
dev:
	@echo "$(BLUE)启动开发环境...$(NC)"
	docker compose -f docker compose.dev.yml up -d

# 停止开发环境
.PHONY: dev-stop
dev-stop:
	@echo "$(BLUE)停止开发环境...$(NC)"
	docker compose -f docker compose.dev.yml down

# 完整构建流程 (构建 + 标记 + 推送)
.PHONY: release
release: build tag-latest push
	@echo "$(GREEN)发布完成: $(IMAGE_NAME):$(IMAGE_TAG) 和 $(IMAGE_NAME):latest$(NC)"

# 本地开发流程 (构建 + 运行)
.PHONY: local
local: build run
	@echo "$(GREEN)本地环境启动完成$(NC)"

# 清理所有相关容器和镜像
.PHONY: cleanup
cleanup:
	@echo "$(RED)正在清理所有相关容器和镜像...$(NC)"
	docker stop $(APP_NAME) 2>/dev/null || true
	docker rm $(APP_NAME) 2>/dev/null || true
	docker rmi $(IMAGE_NAME):$(IMAGE_TAG) 2>/dev/null || true
	docker rmi $(IMAGE_NAME):latest 2>/dev/null || true
	docker compose down -v --remove-orphans 2>/dev/null || true
	@echo "$(GREEN)清理完成$(NC)"

# 检查 Docker 环境
.PHONY: check-docker
check-docker:
	@echo "$(BLUE)检查 Docker 环境...$(NC)
	@docker --version
	@docker compose --version
	@echo "$(GREEN)Docker 环境检查完成$(NC)"