const noSessionListItem = `
  <li class="list-group-item py-3">
    Écrivez sans pause jusqu'à la fin d'une session pour l'enregistrer
    dans votre navigateur et la voir apparaître ici
  </li>
`;

$(document).ready(function() {
  $('#session').val(Date.now().toString());
  
  const sessionsList = $('#previous-sessions');
  sessionsList.empty();
  
  const sessions = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    
    try {
      if (!isNaN(parseInt(key))) {
        const sessionContent = localStorage.getItem(key);
        const sessionDate = new Date(parseInt(key));
        
        sessions.push({
          id: key,
          date: sessionDate,
          content: sessionContent,
          preview: sessionContent.substring(0, 80) + (sessionContent.length > 80 ? '...' : '')
        });
      }
    } catch (e) {
      console.error('Erreur lors de la lecture de la session:', e);
    }
  }
  
  sessions.sort((a, b) => b.date - a.date);
  
  if (sessions.length === 0) {
    sessionsList.append(noSessionListItem);
    return;
  }
  
  sessions.forEach(session => {
    const formattedDate = session.date.toLocaleString('fr-FR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    const wordCount = session.content.split(/\s+/).filter(word => word.length > 0).length;
    
    const sessionItem = $(`
      <li class="list-group-item position-relative session-item" data-session="${session.id}">
        <div class="d-flex justify-content-between align-items-center mb-2">
          <small>${formattedDate}</small>
          <small>${wordCount} mots</small>
        </div>
        <div class="mb-2 text-body-secondary preview-text"><small>${session.preview}</small></div>
        <div class="session-actions text-end">
          <a href="#" class="delete-session text-danger" title="Supprimer la session">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16">
              <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
              <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
            </svg>
          </a>
        </div>
      </li>
    `);
    
    sessionsList.append(sessionItem);
  });

  $('.session-item').click(function(e) {
    const sessionId = $(this).data('session');
    window.location.href = `editor.html?session=${sessionId}`;
  });

  $('.session-actions a').click(function(e) {
    e.stopPropagation();
  });
  
  $('.delete-session').click(function(e) {
    e.preventDefault();
    const sessionId = $(this).closest('.session-item').data('session');
    localStorage.removeItem(sessionId);
    $(this).closest('.session-item').remove();
    if ($('#previous-sessions li').length === 0) {
      sessionsList.append(noSessionListItem);
    }
  });
});