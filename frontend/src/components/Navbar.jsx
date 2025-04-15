import { IconButton } from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import SearchIcon from "@mui/icons-material/Search";
import Logo from '../assets/turf-it-logo-green-triangle-white-transparent.png';

function Navbar({
  isMobile,
  showSearchInput,
  searchQuery,
  handleSearchChange,
  toggleSearchInput,
  toggleFilterDrawer,
  filteredTurfs, // Pass filteredTurfs from the parent component
  isSearchFocused, // Pass isSearchFocused from the parent component
  setIsSearchFocused, // Pass setIsSearchFocused from the parent component
}) {
  return (
    <div className="navbar">
      <div className="nav-item">
        <img src={Logo} alt="TurfIt Logo" className="logo" />
      </div>

      <div className="search-bar">
        {isMobile ? (
          <>
            {showSearchInput ? (
              <input
                type="text"
                className="search-input"
                placeholder="Search turfs..."
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => setIsSearchFocused(true)}
                autoFocus
                aria-label="Search turfs"
              />
            ) : (
              <IconButton onClick={toggleSearchInput} aria-label="Open search">
                <SearchIcon style={{ color: "black" }} />
              </IconButton>
            )}
          </>
        ) : (
          // Desktop View - Always Show Search Input
          <input
            type="text"
            className="search-input"
            placeholder="Search turfs..."
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={() => setIsSearchFocused(true)}
            aria-label="Search turfs"
          />
        )}

        {/* These should always be visible on desktop */}
        {(!isMobile || !showSearchInput) && (
          <>
            {isMobile && (
              <IconButton
                onClick={toggleFilterDrawer}
                aria-label="Open filters"
              >
                <FilterListIcon style={{ color: "black" }} />
              </IconButton>
            )}
            <button className="sign-in-btn">Sign in</button>
          </>
        )}
      </div>

      {/* Search Suggestions */}
      {isSearchFocused && searchQuery && (
        <div className="search-suggestions">
          {filteredTurfs.map((turf) => (
            <div
              key={turf._id}
              className="suggestion-item"
              onClick={() => {
                handleSearchChange({ target: { value: turf.name } }); // Update search query
                setIsSearchFocused(false); // Close suggestions
              }}
            >
              {turf.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Navbar;
