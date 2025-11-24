// 婴儿跟踪应用 - 音乐播放器模块

// 播放列表 - 使用绝对路径确保在任何页面都能访问
const musicTracks = [
    { id: 0, name: '心跳声', src: '/baby_tracker/sounds/heartbeat.mp3' },
    { id: 1, name: '雨声', src: '/baby_tracker/sounds/rain.mp3' },
    { id: 2, name: '海浪声', src: '/baby_tracker/sounds/waves.mp3' },
    { id: 3, name: '森林声', src: '/baby_tracker/sounds/forest.mp3' },
    { id: 4, name: '风声', src: '/baby_tracker/sounds/wind.mp3' },
    { id: 5, name: '钢琴', src: '/baby_tracker/sounds/piano.mp3' },
    { id: 6, name: '冥想', src: '/baby_tracker/sounds/meditation.mp3' },
    { id: 7, name: '摇篮曲', src: '/baby_tracker/sounds/lullaby.mp3' },
    { id: 8, name: '提醒', src: '/baby_tracker/sounds/reminder.mp3' }
];

// 播放器状态管理
const playerState = {
    isPlaying: false,
    currentTrackIndex: 0,
    volume: 0.5,
    loop: true
};

// 全局音频对象 - 重命名以避免冲突
let babyAudioPlayer = null;

// 初始化音乐播放器
function initMusicPlayer() {
    // 创建音频对象
    babyAudioPlayer = new Audio();
    babyAudioPlayer.volume = playerState.volume;
    babyAudioPlayer.loop = playerState.loop;
    
    // 加载第一首曲目
    loadTrack(0);
}

// 加载指定曲目
function loadTrack(index) {
    if (index < 0 || index >= musicTracks.length) return;
    
    const track = musicTracks[index];
    playerState.currentTrackIndex = index;
    
    if (babyAudioPlayer) {
        babyAudioPlayer.pause();
        babyAudioPlayer.src = track.src;
        babyAudioPlayer.load();
        
        // 更新UI显示
        const musicTitle = document.getElementById('musicTitle') || document.querySelector('.music-title');
        if (musicTitle) {
            musicTitle.textContent = track.name;
        }
    }
}

// 播放音乐
function playMusic() {
    if (!babyAudioPlayer) return;
    
    try {
        if (!babyAudioPlayer.src) {
            loadTrack(playerState.currentTrackIndex);
        }
        
        const playPromise = babyAudioPlayer.play();
        
        if (playPromise) {
            playPromise.then(() => {
                playerState.isPlaying = true;
            }).catch(() => {});
        } else {
            babyAudioPlayer.play();
            playerState.isPlaying = true;
        }
    } catch (e) {}
}

// 暂停音乐
function pauseMusic() {
    if (babyAudioPlayer && !babyAudioPlayer.paused) {
        babyAudioPlayer.pause();
        playerState.isPlaying = false;
    }
}

// 切换播放/暂停
function togglePlayPause() {
    if (playerState.isPlaying) {
        pauseMusic();
    } else {
        playMusic();
    }
}

// 下一首
function nextTrack() {
    const nextIndex = (playerState.currentTrackIndex + 1) % musicTracks.length;
    loadTrack(nextIndex);
    if (playerState.isPlaying) {
        playMusic();
    }
}

// 上一首
function prevTrack() {
    const prevIndex = (playerState.currentTrackIndex - 1 + musicTracks.length) % musicTracks.length;
    loadTrack(prevIndex);
    if (playerState.isPlaying) {
        playMusic();
    }
}

// 设置音量
function setVolume(volume) {
    if (babyAudioPlayer) {
        babyAudioPlayer.volume = volume;
        playerState.volume = volume;
    }
}

// 设置循环
function setLoop(loop) {
    if (babyAudioPlayer) {
        babyAudioPlayer.loop = loop;
        playerState.loop = loop;
    }
}

// 页面加载完成后初始化
window.addEventListener('load', function() {
    setTimeout(() => {
        initMusicPlayer();
        
        // 注册用户交互以允许自动播放
        document.addEventListener('click', function initPlayOnClick() {
            if (babyAudioPlayer) {
                babyAudioPlayer.play().then(() => {
                    babyAudioPlayer.pause();
                }).catch(() => {});
            }
            document.removeEventListener('click', initPlayOnClick);
        }, { once: true });
    }, 1000);
});