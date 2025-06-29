const router = require("express").Router();
const prisma = require("../../prisma/client");
const bcrypt = require("bcryptjs");
const { signToken } = require("../utils/jwt");

router.post("/register", async (req, res) => {
    const { email, password, username } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { email, password: hashed, username } });
    const token = signToken({ id: user.id });
    res.json({ token });
});

router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ message: "Invalid credentials" });
    }
    const token = signToken({ id: user.id });
    res.json({ token });
});

module.exports = router;