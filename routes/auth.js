const express = require('express')
const passport = require('passport')
const router = express.Router()


// destination --> Auth with Google
// route GET /auth/google

router.get('/google' , passport.authenticate('google', {scope:['profile']}))


// destination --> Google auth callback
// GET /auth/google/callback
router.get('/google/callback' , passport.authenticate('google',{failureRedirect:'/'}),
(req,res)=>{
    res.redirect('/dashboard')
} )


// des --> logout user
//  /auth/logout

router.get('/logout' , (req,res)=>{
    req.logout()
    res.redirect('/')
    
})





module.exports = router 