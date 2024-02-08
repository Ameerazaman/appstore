





const getDashboard = async (req, res) => {

    res.render('admin/dashboard',{admin:true});
}

module.exports = { getDashboard }