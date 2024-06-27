require('dotenv').config();
const express = require('express')
const stripe= require('stripe')(process.env.STRIPE_SECRET_KEY)
const app=express()

app.set('view engine','ejs')
app.get('/',(req,res)=>{res.render('index.ejs')})

app.post('/checkout',async(req,res)=>{
    const session=await stripe.checkout.sessions.create({
        line_items:[
            {
                price_data:{
                    currency:'usd',
                    product_data:{name:'book'},
                    unit_amount:50
                },

                quantity:1
            }
            
        ],
        mode:'payment',
        success_url:`${process.env.BASE_URL}/complete`,
        cancel_url:`${process.env.BASE_URL}/cancel`

    })


    res.redirect(session.url)
    
})

app.get('/complete',(res,req)=>{
    res.send('your payment was successful')

})



app.listen(3000,()=>console.log('Server started on port 3000'))