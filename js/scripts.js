  var savedNotes = localStorage,
      notes=document.querySelectorAll('.note-item'),
      newNote=document.getElementById('note-input'),
	  newNoteName=document.getElementById('note-name'),
      saveButton=document.getElementById('save-button'),
	  noteName=document.getElementById('note-name'),
	  error=document.createElement('div').className='error-text',
      notesCatalogue = document.getElementById('notesCat'),
      tagsArr= [], tagsArrKeys=[], tagsWrapper=document.getElementById('tags-wrapper'),
	  sorted=0, modalLayer = document.getElementById('modal-layer'), modalWrapper = document.getElementById('modal-wrapper');

  // Открытие модального окна
  var previewNote = function() {
      document.getElementById('modal-layer').className='visible';
  };
  
  // Закрытие модального окна по клику на затемнение
  modalLayer.onclick = function() {
      this.className='';
  };
  
  // Подсветка тэгов в контейнере под редактируемым текстом
  if (newNote.addEventListener) {
      newNote.addEventListener('input', function() {
         document.getElementById('tagsHighlight').innerHTML=highlightTags(newNote.value);
      }, false);
  } 
  else if (newNote.attachEvent) {
           newNote.attachEvent('onpropertychange', function() {
		     document.getElementById('tagsHighlight').innerHTML=highlightTags(newNote.value);
        });
  };
  
  // Функция подсветки тэгов в тексте
  var highlightTags = function(text) {
      let tags= text.match(/#[A-Za-zа-яА-ЯёЁ0-9]*/g);
			if (tags) 
			   tags.forEach(function(item, i, arr) {
                  text=text.split(item).join('<span class="tag">'+item+'</span>');
            });
		return text;
  };
  
  
  // Функция перепривязки событий к обновленному списку заметок
  var renewNotes = function() {
      notes=document.querySelectorAll('.note-item');
	  var removeButton=document.querySelectorAll('.note-item__remove'),
          editButton=document.querySelectorAll('.note-item__edit'),
	      layers = document.querySelectorAll('.note-item__layer');
	  for(i=0; i<notes.length; i++){
		  removeButton[i].onclick = function(){
              var e=this.parentNode.parentNode;
              savedNotes.removeItem(e.dataset.name);
			  e.parentNode.removeChild(e);
			  renewTagsByNotes();
	     };
		 
		 editButton[i].onclick = function(){
              var e=this.parentNode.parentNode;
			  newNoteName.value=(e.dataset.name).substring(1);
              newNote.value=JSON.parse(savedNotes.getItem(e.dataset.name)).text;
			  document.getElementById('tagsHighlight').innerHTML=highlightTags(newNote.value);
	     };
		 
		 layers[i].onclick = function() {
		      var e= this.parentNode;
			  modalWrapper.innerHTML=  '<div id="close-button">×</div><p><strong>'+e.dataset.name.substring(1)+'</strong></p><p>'+highlightTags(JSON.parse(savedNotes.getItem(e.dataset.name)).text)+'</p>';
			  modalLayer.className='visible';
			  document.getElementById('close-button').onclick = function() {
                this.parentNode.parentNode.className='';
              };
		 }
       }
  };
  
  
  // Функция обновления списка тэгов по localStorage
  var renewTags = function() {
      if (!savedNotes['tags']) savedNotes['tags']='';
	  let allTags=savedNotes['tags'].split(',');
	  tagsArrKeys=[];
	  tagsWrapper.innerHTML= '<span id="all-tags">Все заметки</span>';
	  allTags.forEach(function(item, i, arr) {
            var span=document.createElement('span');
            span.innerHTML= item;
			span.onclick = function() {
			   printNotes(item);
			};
			tagsWrapper.appendChild(span);
			tagsArrKeys[item] = '1';
      });
  };
  
  // Функция обновления списка тэгов по заметкам, в случае удаления или редактирования
  var renewTagsByNotes = function() {
      savedNotes['tags']='';
	  tagsArrKeys=[];
	  for (let i=0; i<savedNotes.length; i++)
	    if ((savedNotes.key(i))[0]=='_') {
	       let text=(JSON.parse(savedNotes.getItem(savedNotes.key(i)))).text;
		   let tags=text.match(/#[A-Za-zа-яА-ЯёЁ0-9]*/g);
		   if (tags)
			   tags.forEach(function(item, i, arr) {
                     if (!tagsArrKeys[item]) {
			            tagsArrKeys[item]='1';
				        if (savedNotes['tags'])
					       savedNotes['tags']+=','+item;
				        else savedNotes['tags']=item;
			         }
	            });
        }
    };
  
  // Функция вывода заметок, сортировка при наличии тега
  var printNotes = function(tag='') {
	  notesCatalogue.innerHTML='';
	  // Флаг соответствия тэгу
	  var isProper=1;
	  for (let i=0; i<savedNotes.length; i++) {
	    isProper = 1;
	    if ((savedNotes.key(i))[0]=='_') {
	       let currentNote=JSON.parse(savedNotes.getItem(savedNotes.key(i)));
		    if (tag!='') {
			   if (currentNote.tags) {
				   if (!(currentNote.tags.includes(tag)))
				      isProper=0;
			    }
			   else isProper=0;
			}
		   // Вывод записи
		   if (isProper>0) {
		     let elem = document.createElement('div');
		     elem.className = 'note-item';
		     elem.dataset.name=savedNotes.key(i);
		     let text=currentNote.text;
		     if (text.length>300) {
		         text=text.substring(0,300)+'...';
		     }
		     elem.innerHTML = '<div class="note-item__title"><p>'+savedNotes.key(i).substr(1)+'</p><span class="note-item__remove" title="Удалить"></span><span class="note-item__edit" title="Редактировать"></span></div><p class="note-item__text">'+text+'</p><div class="note-item__layer" title="Просмотр"></div>';
		     notesCatalogue.appendChild(elem);
	       }
	    }
	  }
	  // Перепривязка событий к новому списку записей
	  renewNotes();
	  renewTags();
  };
  
  // Вывод заметок и тэгов при загрузке страницы
  printNotes();
  renewTags();
  renewNotes();
  // ----------

  
  // Отмена сортировки по тэгу
  document.getElementById('all-tags').onclick = function() {
        printNotes();
  };
  
  // Сохранение новой заметки и обновление списка заметок и тэгов
  saveButton.onclick = function(){
	   var text=newNote.value, textTags=newNote.value, name=noteName.value;
	   if (text!='' && name!='') {
	        // Поиск тегов
			let tags= text.match(/#[A-Za-zа-яА-ЯёЁ0-9]*/g);
			if (tags) 
			   tags.forEach(function(item, i, arr) {
                 if (!tagsArrKeys[item]) {
			        tagsArrKeys[item]='1';
					if (savedNotes['tags']!='')
					   savedNotes['tags']+=','+item;
					else savedNotes['tags']=item;
			     }
				 // Тэги для подсветки
				 textTags=textTags.split(item).join('<span class="tag">'+item+'</span>');
                });
		    let note= JSON.stringify({'text': text, 'tags': tags});
			savedNotes.setItem('_'+name, note);
			newNote.innerHTML=textTags;
			// Обновление списка записей и тэгов
		    printNotes();
            renewTagsByNotes();
			renewTags();
			renewNotes();
			noteName.parentNode.className= '';
			newNote.parentNode.className = 'note-input-wrapper';
	   }
	   else {
	      if (name=='') {
			  noteName.parentNode.className += ' error-empty';
		  }
		  if (text=='') {
			  newNote.parentNode.className += ' error-empty';
		  }
	   }
  };