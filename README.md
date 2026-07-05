# Xing Floors — Website Redesign (Preview)

This is a redesigned, modern preview of the Xing Floors website. It is a
**standalone project in this repo** — it is not connected to the live
xingfloors.sg site, and nothing here can change what's currently live.
It's plain HTML/CSS/JavaScript with no build step, so it's easy to preview,
hand to any web developer, or deploy to almost any hosting.

## How to preview it

Open `index.html` in a browser, or serve the folder with any static file
server, e.g.:

```
npx serve .
```

then open the URL it prints.

## Before this goes live — a short checklist

The design, layout, animations and interactions are complete, but a few
things are intentionally left as placeholders:

1. **Contact details.** Search the project for `XXXX` and
   `65XXXXXXXX` — that's the placeholder phone/WhatsApp number and email.
   The real WhatsApp number lives in one place: `js/main.js`, near the top,
   in the `CONFIG` object (`whatsappNumber`). Update it there and the
   floating WhatsApp button, footer, and "chat with us" links all update
   automatically. Phone/email/address text appears in the Contact section
   and footer of `index.html`.
2. **Photos.** Every product photo, gallery photo, and room photo is
   currently a placeholder (a plain generated texture/illustration, clearly
   labelled "Dummy image"/"Dummy photo" on the page). To swap one in: find
   the `<div class="placeholder-art ...">...</div>` block for that item in
   `index.html` and replace it with `<img class="real-photo" src="images/your-photo.jpg" alt="...">`.
   No other changes needed — the layout/hover effects apply automatically.
3. **The enquiry form doesn't send anywhere yet.** It validates properly
   and shows a confirmation message, but there's no backend to receive
   submissions — right now submitting it just shows the success message
   without emailing anyone. The simplest no-code fix: sign up for a free
   form service like Formspree.io or Web3Forms.com, and we add a few lines
   to `js/main.js` to send the form data to the endpoint they give you
   before showing the success message. Ask me to wire this up once you
   have an account — it's a small, quick change.
4. **Sample prices, testimonials, and project photos** in the Products and
   Gallery sections are placeholder text for layout purposes — replace with
   your real pricing, reviews, and project photos whenever convenient.

## What's already done

Full one-page site: hero, product showcase (vinyl, hybrid engineered wood,
decking, wall panels, fluted panels, carpets, grass carpet — no SPC),
interactive flooring visualizer demo, bigger-space inspiration gallery,
filterable project gallery, "not sure what to choose" recommender, service
process timeline, trust/testimonials, and a validated quote form — all
mobile-responsive with scroll animations and no external dependencies.
