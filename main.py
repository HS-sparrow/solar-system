import math
import random
import sys

import pygame


# 初始化 Pygame 和遊戲視窗
pygame.init()

SCREEN_WIDTH = 800
SCREEN_HEIGHT = 600
screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
pygame.display.set_caption("太空射擊遊戲")

# 設定遊戲顏色
BLACK = (7, 10, 28)
WHITE = (240, 245, 255)
BLUE = (55, 145, 255)
LIGHT_BLUE = (130, 220, 255)
RED = (240, 70, 80)
ORANGE = (255, 150, 55)
YELLOW = (255, 225, 90)

clock = pygame.time.Clock()
font = pygame.font.Font(None, 32)
large_font = pygame.font.Font(None, 72)
title_font = pygame.font.Font(None, 92)

# 遊戲設定
PLAYER_SPEED = 6
BULLET_SPEED = 8
BASE_ENEMY_SPEED = 2
SHOT_COOLDOWN = 300  # 射擊冷卻時間，單位是毫秒

# 建立多層星星，讓不同速度和大小增加遠近感
stars = []
for _ in range(90):
    stars.append({
        "x": random.randrange(SCREEN_WIDTH),
        "y": random.randrange(SCREEN_HEIGHT),
        "speed": random.uniform(25, 115),
        "size": random.choice([1, 1, 1, 2, 2, 3]),
        "brightness": random.randint(90, 220),
    })


def reset_game():
    """重設玩家、分數和場上物件，供開始或重新開始遊戲時使用。"""
    global player, bullets, enemies, particles, score, lives, game_over
    global paused, spawn_timer, last_shot_time, started

    player = pygame.Rect(SCREEN_WIDTH // 2 - 25, SCREEN_HEIGHT - 85, 50, 55)
    bullets = []
    enemies = []
    particles = []
    score = 0
    lives = 3
    game_over = False
    paused = False
    started = True
    spawn_timer = 0
    last_shot_time = 0


def draw_stars():
    """繪製星星；每顆星星以自己的速度持續向下移動。"""
    for star in stars:
        shade = star["brightness"]
        color = (shade, shade, min(255, shade + 25))
        pygame.draw.circle(
            screen, color, (int(star["x"]), int(star["y"])), star["size"]
        )


def update_stars(delta_time):
    """依照經過時間推進星空，讓移動速度不受畫面更新率影響。"""
    for star in stars:
        star["y"] += star["speed"] * delta_time
        if star["y"] > SCREEN_HEIGHT:
            star["y"] = 0
            star["x"] = random.randrange(SCREEN_WIDTH)


def draw_player():
    """以多層幾何圖形繪製玩家飛船和引擎火焰。"""
    cx = player.centerx
    top = player.top
    bottom = player.bottom
    flame_length = random.randint(10, 19)

    # 引擎火焰和外側機翼
    pygame.draw.polygon(
        screen, ORANGE,
        [(cx - 9, bottom - 8), (cx, bottom + flame_length), (cx + 9, bottom - 8)],
    )
    pygame.draw.polygon(
        screen, LIGHT_BLUE,
        [(cx - 5, bottom - 5), (cx, bottom + flame_length - 5), (cx + 5, bottom - 5)],
    )
    pygame.draw.polygon(
        screen, (35, 90, 190),
        [(cx, top), (player.left, bottom - 5), (cx - 12, bottom - 17),
         (cx, bottom - 12), (cx + 12, bottom - 17), (player.right, bottom - 5)],
    )

    # 飛船主體、座艙和裝甲線條
    pygame.draw.polygon(
        screen, BLUE,
        [(cx, top + 4), (cx - 15, bottom - 9), (cx, bottom - 17),
         (cx + 15, bottom - 9)],
    )
    pygame.draw.polygon(
        screen, LIGHT_BLUE,
        [(cx, top + 10), (cx - 7, top + 30), (cx, top + 26),
         (cx + 7, top + 30)],
    )
    pygame.draw.line(screen, WHITE, (cx, top + 5), (cx, bottom - 18), 2)
    pygame.draw.line(screen, LIGHT_BLUE, (player.left + 8, bottom - 9), (cx - 10, bottom - 20), 2)
    pygame.draw.line(screen, LIGHT_BLUE, (player.right - 8, bottom - 9), (cx + 10, bottom - 20), 2)


def draw_enemy(enemy):
    """用基本圖形畫出敵方飛船。"""
    pygame.draw.rect(screen, RED, enemy, border_radius=6)
    pygame.draw.polygon(
        screen, RED,
        [(enemy.left, enemy.top + 8), (enemy.left - 8, enemy.bottom),
         (enemy.centerx, enemy.bottom - 8), (enemy.right + 8, enemy.bottom),
         (enemy.right, enemy.top + 8)],
    )
    pygame.draw.circle(screen, YELLOW, (enemy.centerx - 9, enemy.centery), 4)
    pygame.draw.circle(screen, YELLOW, (enemy.centerx + 9, enemy.centery), 4)
    pygame.draw.line(screen, ORANGE, (enemy.left + 8, enemy.bottom - 3),
                     (enemy.right - 8, enemy.bottom - 3), 2)


def create_explosion(x, y):
    """在命中位置產生一群向外散開的短暫粒子。"""
    for _ in range(18):
        angle = random.uniform(0, math.tau)
        speed = random.uniform(50, 230)
        particles.append({
            "x": float(x),
            "y": float(y),
            "vx": math.cos(angle) * speed,
            "vy": math.sin(angle) * speed,
            "life": random.uniform(0.25, 0.55),
            "max_life": 0.55,
            "size": random.randint(2, 5),
            "color": random.choice([YELLOW, ORANGE, RED, LIGHT_BLUE]),
        })


def update_particles(delta_time):
    """更新粒子的位置和存活時間，並移除消失的粒子。"""
    for particle in particles[:]:
        particle["x"] += particle["vx"] * delta_time
        particle["y"] += particle["vy"] * delta_time
        particle["life"] -= delta_time
        if particle["life"] <= 0:
            particles.remove(particle)


def draw_particles():
    """依照粒子剩餘時間繪製爆炸亮點。"""
    for particle in particles:
        fade = max(0.15, particle["life"] / particle["max_life"])
        color = tuple(int(channel * fade) for channel in particle["color"])
        pygame.draw.circle(
            screen, color,
            (int(particle["x"]), int(particle["y"])),
            max(1, int(particle["size"] * fade)),
        )


def draw_game_over():
    """顯示遊戲結束畫面和最後分數。"""
    title = large_font.render("Game Over", True, WHITE)
    result = font.render(f"Final Score: {score}", True, LIGHT_BLUE)
    hint = font.render("Press R to restart", True, WHITE)
    screen.blit(title, title.get_rect(center=(SCREEN_WIDTH // 2, 245)))
    screen.blit(result, result.get_rect(center=(SCREEN_WIDTH // 2, 315)))
    screen.blit(hint, hint.get_rect(center=(SCREEN_WIDTH // 2, 370)))


def draw_start_screen():
    """顯示遊戲標題和開始提示。"""
    title = title_font.render("STAR STRIKER", True, LIGHT_BLUE)
    subtitle = font.render("Defend the galaxy", True, WHITE)
    start_hint = font.render("Press SPACE or ENTER to start", True, YELLOW)
    controls = font.render("Move: LEFT / RIGHT     Fire: SPACE", True, WHITE)
    screen.blit(title, title.get_rect(center=(SCREEN_WIDTH // 2, 225)))
    screen.blit(subtitle, subtitle.get_rect(center=(SCREEN_WIDTH // 2, 285)))
    screen.blit(start_hint, start_hint.get_rect(center=(SCREEN_WIDTH // 2, 365)))
    screen.blit(controls, controls.get_rect(center=(SCREEN_WIDTH // 2, 410)))


# 初始狀態先顯示開始畫面
reset_game()
started = False
running = True

# 遊戲主迴圈
while running:
    delta_time = clock.tick(60) / 1000.0
    update_stars(delta_time)

    # 處理按鍵和關閉視窗事件
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False
        elif event.type == pygame.KEYDOWN:
            if event.key == pygame.K_r:
                # 隨時按 R 都能重新開始
                reset_game()
            elif not started and event.key in (pygame.K_SPACE, pygame.K_RETURN):
                reset_game()
            elif event.key == pygame.K_p and started and not game_over:
                # 按 P 切換暫停狀態
                paused = not paused

    # 暫停及 Game Over 時不更新遊戲物件
    if started and not game_over and not paused:
        # 讀取鍵盤：左右移動
        keys = pygame.key.get_pressed()
        if keys[pygame.K_LEFT]:
            player.x -= PLAYER_SPEED
        if keys[pygame.K_RIGHT]:
            player.x += PLAYER_SPEED
        player.clamp_ip(screen.get_rect())

        # 使用時間檢查射擊冷卻，按住空白鍵也不會超過射速
        current_time = pygame.time.get_ticks()
        if keys[pygame.K_SPACE] and current_time - last_shot_time >= SHOT_COOLDOWN:
            bullets.append(pygame.Rect(player.centerx - 3, player.top - 12, 6, 14))
            last_shot_time = current_time

        # 定時從畫面上方隨機產生敵人
        spawn_timer += 1
        if spawn_timer >= 40:
            enemy_x = random.randint(25, SCREEN_WIDTH - 55)
            enemies.append(pygame.Rect(enemy_x, -35, 40, 30))
            spawn_timer = 0

        # 難度每增加一級，敵人速度提高 1；每 50 分升一級
        difficulty = score // 50 + 1
        enemy_speed = BASE_ENEMY_SPEED + difficulty - 1

        # 移動子彈，並移除飛出畫面的子彈
        for bullet in bullets[:]:
            bullet.y -= BULLET_SPEED
            if bullet.bottom < 0:
                bullets.remove(bullet)

        # 移動敵人；碰到玩家扣生命值，飛出畫面則移除
        for enemy in enemies[:]:
            enemy.y += enemy_speed
            if enemy.colliderect(player):
                enemies.remove(enemy)
                lives -= 1
                if lives <= 0:
                    game_over = True
            elif enemy.top > SCREEN_HEIGHT:
                enemies.remove(enemy)

        # 偵測子彈和敵人的碰撞，命中時加分並產生爆炸
        for bullet in bullets[:]:
            for enemy in enemies[:]:
                if bullet.colliderect(enemy):
                    bullets.remove(bullet)
                    enemies.remove(enemy)
                    create_explosion(enemy.centerx, enemy.centery)
                    score += 10
                    break

        update_particles(delta_time)

    # 重新計算難度，確保 HUD 顯示最新等級
    difficulty = score // 50 + 1

    # 繪製星空背景和狀態列
    screen.fill(BLACK)
    draw_stars()

    if started:
        status = font.render(
            f"Score: {score}    Lives: {lives}    Difficulty: {difficulty}",
            True, WHITE,
        )
        screen.blit(status, (15, 12))
        draw_particles()

        if not game_over:
            draw_player()
            for bullet in bullets:
                pygame.draw.rect(screen, YELLOW, bullet, border_radius=3)
            for enemy in enemies:
                draw_enemy(enemy)

            if paused:
                pause_text = large_font.render("Paused", True, WHITE)
                hint = font.render("Press P to continue", True, WHITE)
                screen.blit(pause_text, pause_text.get_rect(center=(400, 270)))
                screen.blit(hint, hint.get_rect(center=(400, 325)))
        else:
            draw_game_over()
    else:
        draw_start_screen()

    pygame.display.flip()

pygame.quit()
sys.exit()
