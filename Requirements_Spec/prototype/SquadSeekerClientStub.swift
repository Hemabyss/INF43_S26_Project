//
//  SquadSeekerClientStub.swift
//  SquadSeeker — Client (PROTOTYPE STUB)
//
//  HW2 architecture spike. There is NO UI here — just a set of functions that
//  can be called manually to fire HTTPS requests and open a WebSocket, standing
//  in for what the real SwiftUI client will eventually do with live
//  CoreLocation data. Coordinates are hardcoded.
//
//  The REST calls use URLSession (straightforward). The WebSocket receive loop
//  has to be manually re-armed after every message — the main lesson from the
//  prototype (see PrototypeImplementation.md).
//
//  Run as a script-style experiment or drop into a SwiftUI project and call the
//  functions from a button action. Endpoints assume the two stub servers are
//  running locally on ports 8000 (API) and 8001 (Location).
//

import Foundation

enum SquadSeekerClient {

    static let apiBase = URL(string: "http://localhost:8000")!
    static let locationBase = URL(string: "http://localhost:8001")!

    // MARK: - REST: subscribe to interests
    static func subscribe(userId: String, interestIds: [String]) {
        var req = URLRequest(url: apiBase.appendingPathComponent("interests/subscribe"))
        req.httpMethod = "POST"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        // NOTE: snake_case keys to match the FastAPI stub. The camelCase/snake_case
        // mismatch is the JSON-naming issue documented in PrototypeImplementation.md.
        let body: [String: Any] = [
            "user_id": userId,
            "interest_ids": interestIds,
            "visibility": "friends_only"
        ]
        req.httpBody = try? JSONSerialization.data(withJSONObject: body)

        URLSession.shared.dataTask(with: req) { data, _, error in
            if let error = error { print("subscribe error:", error); return }
            if let data = data { print("subscribe ->", String(decoding: data, as: UTF8.self)) }
        }.resume()
    }

    // MARK: - REST: send a GPS update (hardcoded coordinates)
    static func sendLocationUpdate(userId: String) {
        var req = URLRequest(url: locationBase.appendingPathComponent("location/update"))
        req.httpMethod = "POST"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        let body: [String: Any] = [
            "user_id": userId,
            "lat": 33.6405,           // hardcoded — UC Irvine-ish
            "lng": -117.8443,
            "accuracy": 12.0,
            "timestamp": Date().timeIntervalSince1970
        ]
        req.httpBody = try? JSONSerialization.data(withJSONObject: body)

        URLSession.shared.dataTask(with: req) { data, _, error in
            if let error = error { print("location error:", error); return }
            if let data = data { print("location ->", String(decoding: data, as: UTF8.self)) }
        }.resume()
    }

    // MARK: - WebSocket: chat
    static func openChat(sessionId: String) {
        let url = apiBase
            .appendingPathComponent("ws/chat")
            .appendingPathComponent(sessionId)
        // Switch scheme to ws:// for the socket.
        var comps = URLComponents(url: url, resolvingAgainstBaseURL: false)!
        comps.scheme = "ws"
        var request = URLRequest(url: comps.url!)
        // Auth header must be attached at connection open, not per-message.
        request.setValue("Bearer <jwt-goes-here>", forHTTPHeaderField: "Authorization")

        let task = URLSession.shared.webSocketTask(with: request)
        task.resume()

        // The receive loop re-arms itself after each message.
        func receive() {
            task.receive { result in
                switch result {
                case .failure(let error):
                    print("ws receive error:", error)
                case .success(let message):
                    print("ws recv ->", message)
                    receive() // re-arm
                }
            }
        }
        receive()

        task.send(.string("hello from the stub client")) { error in
            if let error = error { print("ws send error:", error) }
        }
    }
}

// Example manual driver (uncomment to run as a command-line experiment):
// SquadSeekerClient.subscribe(userId: "demo_user_1", interestIds: ["hiking", "guitar"])
// SquadSeekerClient.sendLocationUpdate(userId: "demo_user_1")
// SquadSeekerClient.openChat(sessionId: "demo-session")
// RunLoop.main.run()
