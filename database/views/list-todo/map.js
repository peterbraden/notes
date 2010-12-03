function(doc) {
  if (doc.class && doc.class.indexOf('task') > -1){
    var x = doc.importance;
    if (x==undefined) x = 4;
    emit([doc.completed || doc.deleted || false, x], doc);
  }
};