# March of Mind - Game Development Plan

## Key Design Principles

1. **Always Have A Button To Click**: At every stage, there should be an obviously satisfying button that gives immediate feedback and reward, though not necessarily the optimal strategy.

2. **Progressive Unlocks**: New mechanics should be introduced at a pace that keeps the player engaged, with each unlock building on existing systems.

3. **Historical Progression**: The game follows AI development from the 1950s onwards through discoveries and products.

4. **Balanced Resource Management**: Players must make meaningful choices about resource allocation with no single optimal strategy.

5. **Satisfying Feedback Loops**: Every action should provide immediate visual and numerical feedback to create a sense of accomplishment.

## Game Progression Flow

### Game Duration
The complete game experience is designed to take approximately 40 minutes from start to finish. This translates to:
- Roughly 30 seconds per game year
- 2.5 seconds per game month
- A total span from 1950 to 2035 (85 years)

Note: The 2035 end date is a target for game pacing rather than a hard end date. It represents roughly when a player would develop superintelligent AI in the game narrative, but gameplay continues beyond this point.

### Phase 1: The Job Phase
- **Core Mechanic**: Single "Work for the Man" button that earns money
- **Satisfaction**: Watching money number increase
- **Click Action**: The work button itself
- **Progression Goal**: Earn enough to "Found a Company"
- **Fun Factor**: Simple but addictive number growth, anticipation of the new button

### Phase 2: Company Foundation
- **New Mechanics**: 
  - Talent acquisition (single resource)
  - Hardware acquisition (single resource)
  - Resource allocation sliders
  - Product development capability
- **Satisfaction**: Building your company, seeing first product created
- **Click Action**: Still manually generating money while developing first product
- **Progression Goal**: Complete first product that generates passive income
- **Fun Factor**: Seeing your first passive income source, laying foundation for growth

### Phase 3: Marketing & Growth
- **New Mechanics**: 
  - Products generate passive income
  - "Marketing" button appears
- **Satisfaction**: Boosting your product's performance, growing income
- **Click Action**: Marketing button (with diminishing returns but always beneficial)
- **Progression Goal**: Earn enough to found an R&D Center
- **Fun Factor**: Seeing marketing multiply your passive income, no longer needing to manually work

### Phase 4: Research & Innovation
- **New Mechanics**: 
  - "Found R&D Center" button (one-time purchase)
  - Research capabilities unlocked
  - Hardware/Talent allocation now split between Product Development and Research
- **Satisfaction**: Making discoveries based on AI history
- **Click Action**: Research button alongside Marketing button (strategic choice)
- **Progression Goal**: Balance product portfolio with valuable discoveries
- **Fun Factor**: Strategic depth, historical progression, enhanced capabilities

## Core Game Systems

### Money System
- Initial resource via "Work for the Man" button
- Later generated through:
  - Products (passive income)
  - Enhanced by marketing efforts
- Used for:
  - Hiring talent
  - Purchasing hardware
  - Founding new facilities

### Talent System
- Initially a single pool resource
- Hired with money
- Contributes to:
  - Product development speed
  - Research efficiency (when R&D Center is founded)
- Future consideration: Could expand to different talent types

### Hardware System
- Initially a single pool resource
- Purchased with money
- Contributes to:
  - Product quality/income
  - Research capabilities (when R&D Center is founded)
- Future consideration: Could expand to different hardware types

### Products System
- Developed using Talent and Hardware
- Generate passive income once completed
- Income can be boosted through marketing
- Based on real-world AI applications in chronological order
- Each product has specific requirements and income generation potential

### Discoveries System
- Unlocked after founding R&D Center
- Requires dedication of Talent and Hardware resources
- Based on actual historical AI breakthroughs
- Provides various benefits:
  - Enhances existing products
  - Unlocks potential for new product types
  - Improves resource efficiency
- Does not directly generate income

### Resource Allocation System
- Interactive sliders to distribute:
  - Talent between Product Development and Research
  - Hardware between Product Development and Research
- Creates meaningful strategic choices
- Different allocations favor different progression paths

### Marketing System
- Active clicking action after establishing products
- Provides temporary boosts to product income
- Diminishing returns on frequent clicks
- Always beneficial to some degree

## UI/UX Elements

### Main Dashboard
- Clean, modern interface resembling a company dashboard
- Prominent resource counters
- Clear visualization of resource generation rates
- Phase-appropriate action buttons

### Product Development Interface
- Visual representation of products in development
- Progress indicators
- Resource requirements
- Income projections

### Research Interface
- Historical timeline of AI discoveries
- Current research progress
- Benefits of each potential discovery
- Resource allocation controls

### Marketing Interface
- Product performance metrics
- Marketing effectiveness visualization
- Return on investment indicators

## Development Roadmap

### Phase 1 Implementation
- [x] Basic money counter
- [ ] "Work for the Man" button with proper feedback
- [ ] Progress visualization toward company founding
- [ ] "Found a Company" unlock button

### Phase 2 Implementation
- [ ] Talent acquisition system
- [ ] Hardware purchase system
- [ ] Basic resource allocation interface
- [ ] Product development mechanics
- [ ] First passive income implementation

### Phase 3 Implementation
- [ ] Marketing button and mechanics with diminishing returns
- [ ] Product list with historical AI products
- [ ] Market saturation system for each product
- [ ] Products panel with launch and management interface
- [ ] Progress tracking toward R&D Center

### Phase 4 Implementation
- [ ] R&D Center founding mechanic
- [ ] Research system implementation
- [ ] Historical AI discoveries database
- [ ] Advanced resource allocation system
- [ ] Discovery benefits implementation

### Future Considerations
- Expanding talent and hardware into different types
- Additional company facilities
- Market competition mechanics
- Advanced economic simulation