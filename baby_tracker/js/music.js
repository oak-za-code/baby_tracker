// 哄睡音乐播放器功能模块JavaScript

// DOM元素
const musicPlayer = document.getElementById('music-player');
const playPauseBtn = document.getElementById('play-pause-btn');
const nextBtn = document.getElementById('next-btn');
const prevBtn = document.getElementById('prev-btn');
const volumeSlider = document.getElementById('volume-slider');
const musicTitle = document.getElementById('music-title');
const musicList = document.getElementById('music-list');
const shuffleBtn = document.getElementById('shuffle-btn');
const repeatBtn = document.getElementById('repeat-btn');
const timerBtn = document.getElementById('timer-btn');
const timerModal = document.getElementById('timer-modal');
const timerSelect = document.getElementById('timer-select');
const timerConfirmBtn = document.getElementById('timer-confirm-btn');
const timerCancelBtn = document.getElementById('timer-cancel-btn');

// 音频对象
let audio = null;

// 播放列表
const musicTracks = [
    { id: 1, title: '轻柔摇篮曲', file: '/sounds/lullaby.mp3', duration: '3:45' },
    { id: 2, title: '白噪音 - 雨声', file: '/sounds/rain.mp3', duration: '10:00' },
    { id: 3, title: '白噪音 - 海浪声', file: '/sounds/waves.mp3', duration: '10:00' },
    { id: 4, title: '白噪音 - 风声', file: '/sounds/wind.mp3', duration: '10:00' },
    { id: 5, title: '心跳声', file: '/sounds/heartbeat.mp3', duration: '5:00' },
    { id: 6, title: '森林鸟鸣', file: '/sounds/forest.mp3', duration: '8:30' },
    { id: 7, title: '冥想音乐', file: '/sounds/meditation.mp3', duration: '7:15' },
    { id: 8, title: '钢琴轻音乐', file: '/sounds/piano.mp3', duration: '4:20' }
];

// 播放器状态
const playerState = {
    currentTrackIndex: 0,
    isPlaying: false,
    volume: 0.7,
    isShuffle: false,
    repeatMode: 'none', // 'none', 'one', 'all'
    timerId: null,
    remainingTime: 0
};

// 初始化音乐播放器
function initMusicPlayer() {
    // 创建音频对象
    audio = new Audio();
    audio.volume = playerState.volume;
    
    // 加载第一首曲目
    loadTrack(playerState.currentTrackIndex);
    
    // 渲染音乐列表
    renderMusicList();
    
    // 添加音频事件监听器
    addAudioEventListeners();
    
    // 初始化定时器选项
    initTimerOptions();
    
    // 更新UI
    updatePlayerUI();
}

// 加载曲目
function loadTrack(index) {
    if (index < 0 || index >= musicTracks.length) return;
    
    playerState.currentTrackIndex = index;
    const track = musicTracks[index];
    
    // 设置音频源（这里我们只是模拟，实际使用时需要真实的音频文件）
    audio.src = track.file;
    
    // 更新标题
    musicTitle.textContent = track.title;
    
    // 更新选中的曲目
    updateSelectedTrack();
    
    // 如果正在播放，则开始播放
    if (playerState.isPlaying) {
        audio.play().catch(e => console.log('播放失败:', e));
    }
}

// 渲染音乐列表
function renderMusicList() {
    musicList.innerHTML = '';
    
    musicTracks.forEach((track, index) => {
        const listItem = document.createElement('div');
        listItem.className = `music-list-item ${index === playerState.currentTrackIndex ? 'active' : ''}`;
        listItem.setAttribute('data-index', index);
        
        listItem.innerHTML = `
            <div class="music-title">${track.title}</div>
            <div class="music-duration">${track.duration}</div>
        `;
        
        listItem.addEventListener('click', () => {
            loadTrack(index);
        });
        
        musicList.appendChild(listItem);
    });
}

// 更新选中的曲目
function updateSelectedTrack() {
    const listItems = document.querySelectorAll('.music-list-item');
    listItems.forEach((item, index) => {
        if (index === playerState.currentTrackIndex) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

// 播放/暂停
function togglePlayPause() {
    if (playerState.isPlaying) {
        pauseMusic();
    } else {
        playMusic();
    }
}

// 播放音乐
function playMusic() {
    audio.play().then(() => {
        playerState.isPlaying = true;
        updatePlayPauseButton();
    }).catch(e => {
        console.log('播放失败:', e);
        showNotification('播放失败，请稍后再试');
    });
}

// 暂停音乐
function pauseMusic() {
    audio.pause();
    playerState.isPlaying = false;
    updatePlayPauseButton();
}

// 下一首
function playNext() {
    let nextIndex;
    
    if (playerState.isShuffle) {
        // 随机播放
        do {
            nextIndex = Math.floor(Math.random() * musicTracks.length);
        } while (nextIndex === playerState.currentTrackIndex && musicTracks.length > 1);
    } else {
        // 顺序播放
        nextIndex = playerState.currentTrackIndex + 1;
        if (nextIndex >= musicTracks.length) {
            nextIndex = 0;
        }
    }
    
    loadTrack(nextIndex);
}

// 上一首
function playPrevious() {
    let prevIndex;
    
    if (playerState.isShuffle) {
        // 随机播放
        do {
            prevIndex = Math.floor(Math.random() * musicTracks.length);
        } while (prevIndex === playerState.currentTrackIndex && musicTracks.length > 1);
    } else {
        // 顺序播放
        prevIndex = playerState.currentTrackIndex - 1;
        if (prevIndex < 0) {
            prevIndex = musicTracks.length - 1;
        }
    }
    
    loadTrack(prevIndex);
}

// 设置音量
function setVolume(volume) {
    playerState.volume = volume;
    audio.volume = volume;
    
    // 保存音量设置
    const data = getData();
    data.settings = data.settings || {};
    data.settings.musicVolume = volume;
    saveData(data);
}

// 切换随机播放
function toggleShuffle() {
    playerState.isShuffle = !playerState.isShuffle;
    shuffleBtn.classList.toggle('active', playerState.isShuffle);
}

// 切换循环模式
function toggleRepeat() {
    const modes = ['none', 'one', 'all'];
    const currentIndex = modes.indexOf(playerState.repeatMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    playerState.repeatMode = modes[nextIndex];
    
    // 更新按钮文本
    updateRepeatButton();
    
    // 设置音频循环
    audio.loop = playerState.repeatMode === 'one';
}

// 更新播放/暂停按钮
function updatePlayPauseButton() {
    if (playerState.isPlaying) {
        playPauseBtn.textContent = '⏸️';
    } else {
        playPauseBtn.textContent = '▶️';
    }
}

// 更新循环按钮
function updateRepeatButton() {
    switch (playerState.repeatMode) {
        case 'none':
            repeatBtn.textContent = '🔁';
            repeatBtn.classList.remove('active');
            break;
        case 'one':
            repeatBtn.textContent = '🔂';
            repeatBtn.classList.add('active');
            break;
        case 'all':
            repeatBtn.textContent = '🔁';
            repeatBtn.classList.add('active');
            break;
    }
}

// 初始化定时器选项
function initTimerOptions() {
    const durations = [
        { minutes: 5, label: '5分钟' },
        { minutes: 10, label: '10分钟' },
        { minutes: 15, label: '15分钟' },
        { minutes: 20, label: '20分钟' },
        { minutes: 30, label: '30分钟' },
        { minutes: 45, label: '45分钟' },
        { minutes: 60, label: '1小时' },
        { minutes: 90, label: '1.5小时' },
        { minutes: 120, label: '2小时' }
    ];
    
    durations.forEach(duration => {
        const option = document.createElement('option');
        option.value = duration.minutes;
        option.textContent = duration.label;
        timerSelect.appendChild(option);
    });
}

// 打开定时器模态框
function openTimerModal() {
    timerModal.style.display = 'flex';
}

// 关闭定时器模态框
function closeTimerModal() {
    timerModal.style.display = 'none';
}

// 设置定时器
function setTimer(minutes) {
    // 清除之前的定时器
    if (playerState.timerId) {
        clearTimeout(playerState.timerId);
    }
    
    // 转换为毫秒
    const milliseconds = minutes * 60 * 1000;
    
    // 设置新的定时器
    playerState.timerId = setTimeout(() => {
        pauseMusic();
        playerState.timerId = null;
        playerState.remainingTime = 0;
        showNotification('音乐已自动停止播放');
    }, milliseconds);
    
    // 记录剩余时间
    playerState.remainingTime = milliseconds;
    
    // 更新UI
    updateTimerDisplay();
    
    // 关闭模态框
    closeTimerModal();
    
    // 显示通知
    showNotification(`将在${minutes}分钟后自动停止播放`);
}

// 更新定时器显示
function updateTimerDisplay() {
    if (!playerState.timerId || playerState.remainingTime <= 0) {
        timerBtn.textContent = '⏰';
        return;
    }
    
    // 计算剩余分钟数
    const remainingMinutes = Math.ceil(playerState.remainingTime / 60000);
    timerBtn.textContent = `⏰${remainingMinutes}分`;
    timerBtn.classList.add('active');
    
    // 每分钟更新一次
    setTimeout(updateTimerDisplay, 60000);
}

// 清除定时器
function clearTimer() {
    if (playerState.timerId) {
        clearTimeout(playerState.timerId);
        playerState.timerId = null;
        playerState.remainingTime = 0;
        updateTimerDisplay();
        showNotification('定时播放已取消');
    }
}

// 更新播放器UI
function updatePlayerUI() {
    // 更新音量滑块
    volumeSlider.value = playerState.volume;
    
    // 更新播放/暂停按钮
    updatePlayPauseButton();
    
    // 更新随机播放按钮
    shuffleBtn.classList.toggle('active', playerState.isShuffle);
    
    // 更新循环按钮
    updateRepeatButton();
    
    // 更新定时器显示
    updateTimerDisplay();
}

// 添加音频事件监听器
function addAudioEventListeners() {
    // 播放结束事件
    audio.addEventListener('ended', handleAudioEnded);
    
    // 错误事件
    audio.addEventListener('error', handleAudioError);
    
    // 加载事件
    audio.addEventListener('loadedmetadata', () => {
        // 音频元数据加载完成后可以更新显示
    });
}

// 处理音频播放结束
function handleAudioEnded() {
    if (playerState.repeatMode === 'one') {
        // 单曲循环，重新播放当前曲目
        audio.currentTime = 0;
        audio.play();
    } else {
        // 播放下一首
        playNext();
    }
}

// 处理音频错误
function handleAudioError(e) {
    console.log('音频错误:', e);
    showNotification('播放出错，请尝试其他曲目');
    playerState.isPlaying = false;
    updatePlayPauseButton();
}

// 初始化事件监听器
function initMusicEventListeners() {
    // 播放/暂停按钮
    playPauseBtn.addEventListener('click', togglePlayPause);
    
    // 下一首按钮
    nextBtn.addEventListener('click', playNext);
    
    // 上一首按钮
    prevBtn.addEventListener('click', playPrevious);
    
    // 音量滑块
    volumeSlider.addEventListener('input', (e) => {
        setVolume(parseFloat(e.target.value));
    });
    
    // 随机播放按钮
    shuffleBtn.addEventListener('click', toggleShuffle);
    
    // 循环模式按钮
    repeatBtn.addEventListener('click', toggleRepeat);
    
    // 定时器按钮
    timerBtn.addEventListener('click', () => {
        if (playerState.timerId) {
            clearTimer();
        } else {
            openTimerModal();
        }
    });
    
    // 定时器确认按钮
    timerConfirmBtn.addEventListener('click', () => {
        const minutes = parseInt(timerSelect.value);
        if (minutes) {
            setTimer(minutes);
        }
    });
    
    // 定时器取消按钮
    timerCancelBtn.addEventListener('click', closeTimerModal);
    
    // 点击模态框背景关闭
    timerModal.addEventListener('click', (e) => {
        if (e.target === timerModal) {
            closeTimerModal();
        }
    });
}

// 创建模拟音频文件（实际使用时需要真实的音频文件）
function createMockAudioFiles() {
    // 创建模拟音频文件（这里只是为了演示，实际使用时需要替换为真实的音频文件）
    console.log('提示：请确保在sounds文件夹中添加真实的音频文件');
    
    // 创建必要的音频文件占位符
    const audioFiles = ['lullaby.mp3', 'rain.mp3', 'waves.mp3', 'wind.mp3', 'heartbeat.mp3', 'forest.mp3', 'meditation.mp3', 'piano.mp3'];
    
    audioFiles.forEach(file => {
        const filePath = `/Users/mdkmdk/Downloads/tan/baby_tracker/sounds/${file}`;
        // 这里我们只是记录需要的文件，实际创建需要用户手动添加
        console.log(`需要音频文件: ${filePath}`);
    });
}

// 页面加载完成后初始化
window.addEventListener('load', () => {
    // 检查是否有保存的音量设置
    const data = getData();
    if (data.settings && typeof data.settings.musicVolume === 'number') {
        playerState.volume = data.settings.musicVolume;
    }
    
    initMusicPlayer();
    initMusicEventListeners();
    createMockAudioFiles();
});