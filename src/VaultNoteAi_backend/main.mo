// Motoko smart contract for VaultNoteAi
import Time "mo:base/Time";
import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Result "mo:base/Result";
import Error "mo:base/Error";
import HashMap "mo:base/HashMap";
import Iter "mo:base/Iter";
import Int "mo:base/Int";
import Array "mo:base/Array";
import Bool "mo:base/Bool";
import Nat "mo:base/Nat";

actor Notes {
    // Types
    public type Note = {
        id: Text;
        title: Text;
        content: Text;
        encryptedContent: Text;
        transcription: ?Text;
        summary: ?Text;
        tags: [Text];
        createdAt: Int;
        updatedAt: Int;
        version: Nat;
        hash: Text;
        owner: Principal;
    };

    public type NoteInput = {
        title: Text;
        content: Text;
        encryptedContent: Text;
        transcription: ?Text;
        summary: ?Text;
        tags: [Text];
        hash: Text;
    };

    public type Error = {
        #NotFound;
        #Unauthorized;
        #InvalidInput;
    };

    // State
    private stable var noteEntries: [(Text, Note)] = [];
    private var notes = HashMap.HashMap<Text, Note>(10, Text.equal, Text.hash);

    // Initialize from stable storage
    system func preupgrade() {
        noteEntries := notes.entries() |> Iter.toArray(_);
    };

    system func postupgrade() {
        notes := HashMap.fromIter<Text, Note>(noteEntries.vals(), noteEntries.size(), Text.equal, Text.hash);
        noteEntries := [];
    };

    // Generate unique ID
    private func generateId(caller: Principal): Text {
        let now = Time.now();
        Text.concat(Int.toText(now), Principal.toText(caller));
    };

    // Create note
    public shared(msg) func createNote(input: NoteInput): async Result.Result<Note, Error> {
        let caller = msg.caller;
        let noteId = generateId(caller);
        let now = Time.now();

        let note: Note = {
            id = noteId;
            title = input.title;
            content = input.content;
            encryptedContent = input.encryptedContent;
            transcription = input.transcription;
            summary = input.summary;
            tags = input.tags;
            createdAt = now;
            updatedAt = now;
            version = 1;
            hash = input.hash;
            owner = caller;
        };

        notes.put(noteId, note);
        #ok(note)
    };

    // Get user's notes
    public shared(msg) func getUserNotes(): async [Note] {
        let caller = msg.caller;
        let userNotes = Array.filter<Note>(
            notes.vals() |> Iter.toArray(_),
            func(note: Note): Bool {
                Principal.equal(note.owner, caller)
            }
        );
        userNotes
    };

    // Update note
    public shared(msg) func updateNote(noteId: Text, input: NoteInput): async Result.Result<Note, Error> {
        let caller = msg.caller;
        
        switch (notes.get(noteId)) {
            case (?existingNote) {
                if (not Principal.equal(existingNote.owner, caller)) {
                    return #err(#Unauthorized);
                };

                let updatedNote: Note = {
                    id = noteId;
                    title = input.title;
                    content = input.content;
                    encryptedContent = input.encryptedContent;
                    transcription = input.transcription;
                    summary = input.summary;
                    tags = input.tags;
                    createdAt = existingNote.createdAt;
                    updatedAt = Time.now();
                    version = existingNote.version + 1;
                    hash = input.hash;
                    owner = caller;
                };

                notes.put(noteId, updatedNote);
                #ok(updatedNote)
            };
            case null {
                #err(#NotFound)
            };
        }
    };

    // Delete note
    public shared(msg) func deleteNote(noteId: Text): async Result.Result<(), Error> {
        let caller = msg.caller;
        
        switch (notes.get(noteId)) {
            case (?note) {
                if (not Principal.equal(note.owner, caller)) {
                    return #err(#Unauthorized);
                };
                
                notes.delete(noteId);
                #ok(())
            };
            case null {
                #err(#NotFound)
            };
        }
    };

    // Get note by ID
    public shared(msg) func getNote(noteId: Text): async Result.Result<Note, Error> {
        let caller = msg.caller;
        
        switch (notes.get(noteId)) {
            case (?note) {
                if (not Principal.equal(note.owner, caller)) {
                    return #err(#Unauthorized);
                };
                #ok(note)
            };
            case null {
                #err(#NotFound)
            };
        }
    };

    // Get total note count for user
    public shared(msg) func getUserNoteCount(): async Nat {
        let caller = msg.caller;
        let userNotes = Array.filter<Note>(
            notes.vals() |> Iter.toArray(_),
            func(note: Note): Bool {
                Principal.equal(note.owner, caller)
            }
        );
        userNotes.size()
    };
}