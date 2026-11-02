[← Product specification](./README.md)

# Search

A person finds a note by typing words; the result lists the **notes** they can read, best match first.

- Search covers the title and the body of a note, and ignores upper and lower case and accents.
- A note appears in the results only for people who can read it: a **link** does not put a note in anyone's search.
- Results are ready within a second of a note being saved.
- The search uses the full-text search of the database (postgres), so a word and its other forms match alike for the languages the database supports.
