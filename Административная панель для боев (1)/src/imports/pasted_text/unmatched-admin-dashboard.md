Build a responsive admin dashboard for ranked Unmatched matches

Create an administrative dashboard for managing ranked matches in Unmatched between friends. The interface should feel tactical, clean, competitive, and system-driven — a mix of modern esports dashboard, tabletop strategy companion, and minimal tournament control panel.

The product is not a flashy gaming portal. It should feel like a serious match operations system: structured, readable, fast to navigate, and fair by design.

Core Product Goal

The dashboard must allow a group of friends to:

create and manage 1v1 matches
create and manage 2v2 matches
create and manage 1v1 and 2v2 tournaments
maintain a player rating system
manage character selection
support a fair pick system, where stronger players receive weaker-tier characters and weaker players receive stronger-tier characters to balance the game
reflect the game rules and restrictions from the rules block / rules file

The design should clearly communicate that this is a ranked system with balancing logic, not just a casual score tracker.

Visual Direction

The aesthetic should be minimal, competitive, and data-centric.

Think:

tournament operations panel
tactical drafting interface
structured ranking system
clean digital tabletop assistant

The UI should avoid childish “gamey” clichés. No fantasy overload, no excessive effects, no noisy gradients. The feeling should be closer to professional bracket software plus premium gaming utility dashboard.

Core Design System
Palette

Use a restrained, dark-first interface with high contrast and strong hierarchy:

Background: near-black / graphite
Surface blocks: dark slate / muted charcoal
Borders: subtle steel grey
Primary text: off-white
Secondary text: cool grey
Accent color: one vivid competitive accent for actions and highlights
Suggested options:
electric orange
tactical lime
sharp cyan

Use the accent color only for:

primary CTA buttons
selected states
active tabs
rating change indicators
important match statuses

Do not overload the interface with multiple bright colors.

Typography

Use a modern sans-serif with strong legibility:

Primary: Inter, Geist, or similar
Secondary / technical metadata: monospaced font for rating numbers, IDs, match states, draft order, and tournament round labels

Typography should feel:

dense enough for dashboard usage
readable on desktop and mobile
precise and systematic

Use stronger weights for headings and match states, and monospaced smaller labels for system information.

Layout and Grid

Use a strict dashboard grid with clear segmentation.

modular layout
visible separation between blocks using thin borders or contrast surfaces
strong spacing rhythm
cards can have small radius or zero radius depending on the chosen style direction, but overall feel should remain sharp and structured

The design must scale well between:

desktop admin usage
tablet usage
mobile phone usage

Mobile support is mandatory. The interface must be designed as a fully responsive system, not as a desktop screen later compressed into mobile.

UX Principles
prioritize speed of action
minimize number of clicks for creating matches
make current ratings, team compositions, and character balance immediately visible
expose fairness logic clearly so players understand why certain characters are offered
keep tournament progress readable at a glance
avoid clutter, but preserve enough data density for power users
Main Sections
1. Dashboard Home

The main dashboard should provide a quick operational overview.

Must include:
upcoming matches
active tournaments
player rating table
recent match results
quick action buttons:
create 1v1 match
create 2v2 match
create tournament
add result
current balance / draft alerts
optional top performers / streak indicators
Visual approach:

The home screen should feel like a control center. Information blocks should be compact, aligned, and readable in 1–2 seconds.

2. Match Creation Flow

This is one of the core features and should be treated as a high-priority UX scenario.

Modes:
1v1
2v2
Flow should include:
player selection
team formation
rating preview
character pool generation
fairness logic preview
confirmation before match creation
Design requirements:

The flow should feel like a draft room or pre-match setup panel.

Use a step-by-step structure such as:

Select players
Define format
Generate available characters
Confirm picks
Start match

The system should visually explain the balancing logic in a simple way.

For example:

Player A rating: 100
Player B rating: 1000
The higher-rated player gets access to lower-tier characters
The lower-rated player gets access to higher-tier characters

This logic should not feel hidden. It should be visible as a system rule with supporting UI text, badges, or small info panels.

3. Character Selection Interface

This is the most unique part of the product and should become a signature screen.

Functional idea:

Each player has a rating.
Each character also has a strength tier or rating.
The system uses both values to generate a fair character pool.

The interface should show:
player card with rating
team side / slot
available character pool
character tier labels
lock / banned / unavailable states
recommended balanced picks
explanation of why certain characters are available
Visual recommendation:

Use a draft-board style layout:

player cards on top or left
character cards in a structured grid
tier indicators visible as tags
hover / tap reveals rule context
selected characters pinned clearly

Character cards should include:

character name
tier
optional role / style tag
status state

The screen should feel fair, transparent, and strategic.

4. Player Ratings

Create a dedicated rating section for all players.

Must include:
leaderboard
current rating
change over time
wins / losses
1v1 stats
2v2 stats
recent activity
optional streaks
Visual style:

A clean ranked table, not a casual friends list.

Possible elements:

sortable columns
compact player rows
trend indicators
rating delta after match
filters by format

This section should feel close to a competitive ladder system.

5. Tournament Management

The tournament area should support:

1v1 tournaments
2v2 tournaments
bracket creation
round progression
match result submission
tournament status tracking
Recommended layout:
bracket view for desktop
simplified stacked round view for mobile
participant list
current round focus
progress status
champion block

The tournament UI should feel structured and calm, not visually overloaded.

6. Match History and Reports

A dedicated section should store completed matches.

Include:
date
format
players / teams
chosen characters
winner
rating changes
tournament / casual / ranked label
UX note:

Users should be able to quickly answer:

who played
with which characters
who won
how the ratings changed
7. Social / Group Layer

Since this is built for a friend group, the product may include a light social layer.

Optional elements:
recent activity feed
rivalries
“played most with”
mini achievements
season summary

These should remain secondary and not overpower the competitive dashboard purpose.

Components
Key UI Components

Design a consistent system of reusable components:

player card
character card
team card
match card
tournament card
leaderboard row
rating badge
tier badge
result modal
draft stepper
bracket node
filter bar
status pill
confirmation drawer / modal
Style notes:

Components should feel systematic and robust.
Hover and active states must be subtle, fast, and clear.
No overly playful animation.

Interaction Design
Motion

Use minimal motion only:

soft fade
quick highlight
subtle slide for panel changes
instant feedback for selection / lock states

Avoid:

bouncy transitions
exaggerated gaming effects
flashy loading animations
Responsive Requirements

Mobile support is обязательна.

The design must include full responsive behavior for:

desktop
tablet
mobile
Mobile UX requirements:
all primary actions available from mobile
tables must degrade gracefully into stacked cards
tournament brackets should switch into vertical round lists
filters should become drawers, tabs, or horizontal scrollers
match creation should remain usable with one hand
character selection should be optimized for tap targets
sticky bottom action bar is allowed on mobile
no critical hover-only interactions

The product must be designed mobile-first or at least mobile-aware from the start.
It should feel like a real usable companion app, not a desktop admin shrunk onto a phone.

Tone of Interface Copy

Use concise product language:

direct
tactical
system-oriented
understandable even for non-technical users

Avoid overly corporate or fantasy-styled copy.
The interface language should sound like a ranked match control system.

Examples:

Create Match
Start Draft
Assign Characters
Lock Team
Submit Result
Rating Updated
Tournament Round 2
Character Pool Generated
What the design should communicate emotionally

The interface should make users feel:

the system is fair
matches are official
rankings matter
drafting is strategic
tournaments are organized
data is easy to trust
Technical Execution

Use Tailwind CSS for layout and styling.

Frontend expectations:
responsive grid system
reusable design tokens
consistent spacing scale
dark theme first, with optional light mode later
accessible contrast
keyboard-friendly admin interactions where relevant
Important:
prioritize usability over decorative visuals
no visual clutter
no excessive gradients
no chaotic gaming styling
keep the product scalable for future additions like seasons, bans, and advanced statistics
Deliverables expected from design

The design work should include:

dashboard home screen
create match flow
character selection / balancing screen
leaderboard screen
tournament screen
match history screen
mobile versions of key screens
component system / UI kit
responsive behavior specification