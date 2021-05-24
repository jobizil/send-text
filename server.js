import Express from "express"
import ejs from "ejs"
import { Server } from "socket.io"
import Nexmo from "nexmo"
import path from "path"
import { CLIENT_RENEG_LIMIT } from "tls"

// Init nexmo
const nexmo = new Nexmo(
	{
		apiKey: "5b4dc915",
		apiSecret: "K2MOztyoOqeVwc96",
	},
	{ debug: true },
)

const app = new Express()

// Setup Template Engine
app.set("view engine", "html")
app.engine("html", ejs.renderFile)

// Public Folder Setup
const __dirname = path.resolve(path.dirname(""))
app.use(Express.static(path.join(__dirname, "/public")))

app.use(Express.urlencoded({ extended: true }))
app.use(Express.json())

// Routes
app.get("/", (req, res) => {
	res.render("index")
})

// Get Forms Submit
app.post("/", (req, res) => {
	const number = req.body.number
	const text = req.body.text

	nexmo.message.sendSms("Jobizil", number, text, { type: "unicode" }, (err, responseData) => {
		if (err) {
			console.log(err)
		} else {
			// console.dir(responseData)
			// Get response data
			const { messages } = responseData
			const { ["message-id"]: id, ["to"]: to, ["error-text"]: error } = messages[0]

			const data = {
				id,
				error,
				number,
			}

			// Emit to client
			io.emit("smsStatus", data)
		}
	})
})

const port = process.env.PORT || 3400

const server = app.listen(port, () => {
	console.log("Server Running")
})

// Connect to socket.io
const io = new Server(server)

io.on("connection", (socket) => {
	console.log("Connected")
	io.on("disconnect", () => {
		console.log("Disconnected")
	})
})
