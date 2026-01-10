let completedTasks = new Set();
let validatedSkills = new Set();

document.addEventListener('DOMContentLoaded', () => {
    loadProgress();
    bindTaskEvents();
    bindSkillEvents();
    updateUI();
});

function bindTaskEvents() {
    document.querySelectorAll('.task-item').forEach(item => {
        item.addEventListener('click', (e) => {
            // Ignore clicks on links or copy buttons
            if (e.target.closest('a') || e.target.closest('.copy-text-btn') || e.target.closest('pre')) return;

            // If the item contains a checkbox, the browser will already fire a click on it
            // when the label is clicked. To avoid double execution, we only react to the
            // actual check state change or we handle the click once.
            // The simplest is to prevent default click behavior if we handle it manually,
            // but since it's a label-wrapped checkbox, let's just use the checkbox change.
            const input = item.querySelector('input');
            if (input && e.target !== input) {
                // Click on label (not on input directly) -> browser will click the input
                // so we do nothing and wait for the bubbled event from the input
                return;
            }

            toggleTask(item);
        });
    });
}

function bindSkillEvents() {
    document.querySelectorAll('.skill-item').forEach(item => {
        item.addEventListener('click', () => {
            toggleSkill(item.dataset.skill);
        });
    });
}

function toggleTask(taskItem) {
    const taskId = taskItem.dataset.task;
    const skills = taskItem.dataset.skills.split(',');

    if (completedTasks.has(taskId)) {
        completedTasks.delete(taskId);
        taskItem.classList.remove('completed');
        // We keep the skills even if the task is unchecked, 
        // as requested: the student might want to keep their skill progression
        // or they might have validated it manually.
    } else {
        completedTasks.add(taskId);
        taskItem.classList.add('completed');
        skills.forEach(skill => validatedSkills.add(skill));
    }

    updateUI();
    saveProgress();
}

function toggleSkill(skillId) {
    if (validatedSkills.has(skillId)) {
        validatedSkills.delete(skillId);
    } else {
        validatedSkills.add(skillId);
    }
    updateUI();
    saveProgress();
}


function updateUI() {
    const totalTasks = document.querySelectorAll('.task-item').length;
    const completedCount = completedTasks.size;
    const percent = Math.round((completedCount / totalTasks) * 100);

    const circumference = 326.73;
    const offset = circumference - (percent / 100) * circumference;
    document.getElementById('progress-ring').style.strokeDashoffset = offset;
    document.getElementById('progress-percent').textContent = percent;

    document.getElementById('tasks-done').textContent = completedCount + '/' + totalTasks;
    document.getElementById('skills-done').textContent = validatedSkills.size;

    const progressCircle = document.getElementById('progress-circle');
    if (percent === 100) {
        progressCircle.classList.add('complete');
    } else {
        progressCircle.classList.remove('complete');
    }

    document.querySelectorAll('.skill-item').forEach(item => {
        if (validatedSkills.has(item.dataset.skill)) {
            item.classList.add('validated');
        } else {
            item.classList.remove('validated');
        }
    });

    document.querySelectorAll('.task-item').forEach(item => {
        const isCompleted = completedTasks.has(item.dataset.task);
        const checkbox = item.querySelector('input[type="checkbox"]');
        if (isCompleted) {
            item.classList.add('completed');
            if (checkbox) checkbox.checked = true;
        } else {
            item.classList.remove('completed');
            if (checkbox) checkbox.checked = false;
        }
    });

    const banner = document.getElementById('completion-banner');
    if (percent === 100) {
        banner.classList.add('show');
    } else {
        banner.classList.remove('show');
    }
}

function saveProgress() {
    localStorage.setItem('tp-brulerie-progress', JSON.stringify({
        tasks: Array.from(completedTasks),
        skills: Array.from(validatedSkills)
    }));
}

function loadProgress() {
    const saved = localStorage.getItem('tp-brulerie-progress');
    if (saved) {
        const data = JSON.parse(saved);
        completedTasks = new Set(data.tasks || []);
        validatedSkills = new Set(data.skills || []);
    }
    // updateUI handles setting classes and checkbox states
}

function toggleNav() {
    document.getElementById('nav-menu').classList.toggle('open');
}

function switchTab(tabId) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    event.target.classList.add('active');
    document.getElementById('tab-' + tabId).classList.add('active');
}

function toggleAccordion(header) {
    header.parentElement.classList.toggle('open');
}

function copyCode(btn) {
    const text = btn.parentElement.textContent.replace('Copier', '').trim();
    navigator.clipboard.writeText(text);
    btn.textContent = '✓';
    btn.classList.add('copied');
    setTimeout(() => {
        btn.textContent = 'Copier';
        btn.classList.remove('copied');
    }, 2000);
}

function copyText(elementId) {
    navigator.clipboard.writeText(document.getElementById(elementId).innerText);
    const btn = document.getElementById(elementId).parentElement.querySelector('.copy-text-btn');
    btn.innerHTML = '✓ Copié !';
    setTimeout(() => btn.innerHTML = '📋 Copier', 2000);
}

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            window.scrollTo({ top: target.getBoundingClientRect().top + window.pageYOffset - 90, behavior: 'smooth' });
        }
        document.getElementById('nav-menu').classList.remove('open');
    });
});
