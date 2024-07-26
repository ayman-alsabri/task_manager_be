
export const signUp = (bcrypt, db, jwt) => async (req, res) => {

    const { name, email, password } = req.body;
    const timeStamp = new Date();

    const hash = bcrypt.hashSync(password, bcrypt.genSaltSync());


    const id = (await db.insert({
        email: email,
        username: name,
        password: hash,
        createdat: timeStamp
    }).into('users').returning("id").catch((err) => {
        res.status(401).json(`email already in use`);
        return null;
    }));
    if (!id) { return; }
    req.session.userId = id[0];
    // const token = jwt.sign( id[0], process.env.JWT_KEY, { expiresIn: '1h' });
    // res.cookie('token', token, {
    //     httpOnly: true,
    //     secure: true, // Set to true if serving over HTTPS
    //     maxAge: 3600000 // 1 hour in milliseconds
    //   });
    res.json({ 'id': id[0].id });
    return;
}

export const login = (bcrypt, db, jwt) => async (req, res) => {
    // res.header({'Access-Control-Allow-Origin': 'localhost:3005'});
    const emailAnadHash = (await db.select('email', 'password').from('users').where('email', '=', req.body.email).catch(err => {
        res.status(500).end('somthing went wrong');
    }))[0];

    if (!emailAnadHash) {
        res.status(400).json('email is not registered');
        return;
    }

    const isValid = bcrypt.compareSync(req.body.password, emailAnadHash.password);
    if (!isValid) {

        res.status(404).json('password is incorrect')
        return;
    }
    let user = (await db.select('*').from('users').where('email', '=', req.body.email).catch(err => {
        res.status(500).end('somthing went wrong')
    }))[0];
    
    req.session.userId = user.id;
    req.session.save();
    // const token = jwt.sign( {"id":user.id}, process.env.JWT_KEY, { expiresIn: '1h' });
    // res.cookie('token', token, {
    //     httpOnly: true,
    //     secure: true, // Set to true if serving over HTTPS
    //     maxAge: 3600000 // 1 hour in milliseconds
    //   });
    res.json({ 'id': user.id, 'userName': user.username });
    return;
}



export const logOut = () => (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json('Could not log out.');
        } else {
            res.json('Logged out');
        }
    });
    console.log('logged out successfully')
}

