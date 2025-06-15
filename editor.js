const CONTENT_LIFE_TIME_IN_MILLISECONDS = 7000;

class Timer {
  #callback;
  #duration;
  #endTime;
  #intervalId;
  #remainingTime;

  constructor(durationInMinutes, callback) {
    this.#callback = callback;
    this.#duration = Math.max(durationInMinutes, 0.1) * 60 * 1000;
    this.#remainingTime = this.#duration;
  }

  hasEnded() {
    return 0 === this.#remainingTime;
  }

  reset() {
    this.#endTime = Date.now() + this.#duration;
    this.update();
  }

  start() {
    if (this.#intervalId) {
      return;
    }
    this.#endTime = Date.now() + this.#remainingTime;
    this.#intervalId = setInterval(this.update.bind(this), 100);
  }

  stop() {
    if (!this.#intervalId) {
      return;
    }
    clearInterval(this.#intervalId);
    this.#intervalId = null;
    this.update();
  } 

  toString() {
    const remainingTimeInSeconds = this.#remainingTime / 1000;
    const seconds = Math.floor(remainingTimeInSeconds % 60);
    const remainingTimeInMinutes = remainingTimeInSeconds / 60;
    const minutes = Math.floor(remainingTimeInMinutes % 60);
    const remainingTimeInHours = remainingTimeInMinutes / 60;
    const hours = Math.floor(remainingTimeInHours);
    
    const displayHours = hours.toString();
    const displayMinutes = minutes.toString().padStart(2, '0');
    const displaySeconds = seconds.toString().padStart(2, '0');
    
    return `${hours > 0 ? displayHours + ':' : ''}${displayMinutes}:${displaySeconds}`; 
  }

  update() {
    this.#remainingTime = Math.max(this.#endTime - Date.now(), 0);
    this.hasEnded() && this.stop();
    this.#callback();
  }
}

$(document).ready(function() {
  const editorElement = $('#editor');
  const timerElement = $('#timer');

  const params = new URLSearchParams(window.location.search);
  const durationInMinutes = Math.max(1, parseInt(params.get('duration')) || 15);
  const sessionId = params.get('session') || Date.now().toString();
  const sessionContent = localStorage.getItem(sessionId);

  if (sessionContent) {
    editorElement.val(sessionContent).prop('disabled', true);
    return;
  }

  const timer = new Timer(durationInMinutes, function() {
    timerElement.text(this.toString());
    
    if (this.hasEnded()) {
      editorElement.stop(true, false).css('color', 'rgba(0, 0, 0, 1)').prop('disabled', true);
      timerElement.removeClass('text-bg-primary').addClass('text-bg-success');
      localStorage.setItem(sessionId, editorElement.val());
    }
  });

  let lastEditorContent = '';

  editorElement.on('input', function() {
    const editorContent = editorElement.val();

    if (timer.hasEnded() || lastEditorContent == editorContent) { 
      return;
    }

    const hasContentChanged = editorContent.trim() != lastEditorContent.trim()
    const hasContentLenghtIncreased = editorContent.length > lastEditorContent.length;
    const hasContentStartChanged = !editorContent.startsWith(lastEditorContent);
    const isContentEmpty = '' === editorContent;

    lastEditorContent = editorContent;

    if (isContentEmpty) {
      timer.stop();
      timer.reset();
    } else if (!hasContentChanged || !hasContentLenghtIncreased || hasContentStartChanged) {
      return;
    }
    
    editorElement.stop(true, false).css('color', 'rgba(0, 0, 0, 1)');

    if (!isContentEmpty) {
      timer.start();
      editorElement.animate({color: 'rgba(0, 0, 0, 0)'}, CONTENT_LIFE_TIME_IN_MILLISECONDS, function() {
        editorElement.val('').trigger('input').focus();
      });
    }
  });

  timer.reset();
  editorElement.focus();
});