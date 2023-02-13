const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const connection = require('../../database/accountdb');

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({
  extended: true
}));

// Verification de la connexion à la base de données.
connection.connect(function(err) {
    if(err) 
      console.log('error:', err.stack);
    else 
      console.log('connected as id:', connection.threadId);
})

// Récupération des projets stocké dans la table informations_project.
router.get('/get_articles', (req, res) => {
    connection.query('SELECT * FROM informations_project', function(err, result) {
    if(!err) 
        res.json({ data: result });
    else 
        res.status(500).json({ message: err })
  });
})

// Methodes permettant le CRUD des commentaires.

// Recupère liste commentaire avec le nombre de like.
// body value: id_project
router.get('/get_comment', (req, res) => {
  const id_project = req.query.index;
  connection.query(`call get_comment_article(${id_project})`, (err, result) => {
      if(!err) 
          res.json({data: result[0], status: 200});
      else 
          res.status(500).json({message: 'Erreur lors de la récupération des commentaires', status: 500});
      
  });
})

// Ajoute un commentaire
// body values: object={id_user, content, id_project}
router.post('/add_comment', (req, res) => {
    const date = new Date().toLocaleDateString('fr-FR');
    const { id_project, content, id_user } = req.body;
    connection.query(`CALL add_comment_article(${id_user}, "${content}", ${id_project}, "${date}")`, (err, result) => {
        if(!err)
            res.json({message: "Commentaire ajouté avec succès", status: 200});
        else 
            res.status(500).json({message: 'Erreur lors de l\'ajout d\'un commentaire', status: 500});
    })
})

// Ajoute une étoile ou retire une étoile sur un commentaire
// body values: id_user, id_comment
router.post('/add_like_comment', (req, res) => {
  const { id_user, id_comment } = req.body;
  connection.query(`call add_like_comment(${id_user}, ${id_comment})`, (error, result) => {
      if(!error) {
          const bool = JSON.parse(JSON.stringify(result))[0][0].response;
          const message = bool === 1 ? 'Etoile ajouté avec succès' : 'Etoile enlevé avec succès';
          res.json({message: message, status: 200});
        }
      else
          res.status(500).json({message: 'Erreur lors de l\'ajout d\'une étoile', status: 500});
  })
})

// Modifie le contenue d'un commentaire
// body values: id_user, id_comment, content_comment
router.put('/update_comment', (req, res) => {
  const { idUser, idComment, contentComment } = req.body;
  connection.query(`
      UPDATE comment_article
      SET comment_article.content_comment = "${contentComment}",
          comment_article.is_edited_comment = 1
      WHERE comment_article.id_comment = ${idComment}
      AND comment_article.id_user = ${idUser}`, (error, result) => {
      if(!error)
          res.json({message: 'Commentaire modifié avec succès', status: 200});
      else
          res.status(500).json({message: 'Erreur lors de la modification d\'un commentaire', status: 500});
  })
});

// Supprime un commentaire
// body values: id_user, id_comment
router.delete('/delete_comment', (req, res) => {
  const { id_user, id_comment } = req.body;
  connection.query(`
      DELETE FROM comment_article 
      WHERE comment_article.id_comment = ${id_comment}
      AND comment_article.id_user = ${id_user}`, (error, result) => {
          if(!error)
              res.json({message: 'Commentaire supprimé avec succès', status: 200});
          else
              res.status(500).json({message: 'Erreur lors de la suppréssion du commentaire', status: 500});
      })
})

router.post('/get_account', (req, res) => {
  const { familyName, givenName, imageUrl, email, googleId } = req.body;
  connection.query(`call get_user_account("${familyName}", "${givenName}", "${imageUrl}", "${email}", "${googleId}")`, (error, result) => {
      if(!error)
        res.json({data: result[0], status: 200});
      else 
        res.status(500).json({message: 'Erreur lors de la récupération des informations du compte', status: 500});
  })
})


module.exports = router;