-- GIBRAS Core Spatial Database Schema
-- Standard: PostgreSQL 14+ with PostGIS 3+
-- Primary Spatial SRS: EPSG:4326 (Storage & Web) and EPSG:32643 (Metric Calculations)

CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Administrative Boundaries (Districts and Taluks)
CREATE TABLE IF NOT EXISTS administrative_boundaries (
    id SERIAL PRIMARY KEY,
    district VARCHAR(64) NOT NULL,
    taluk VARCHAR(64) NOT NULL,
    taluk_code VARCHAR(16) UNIQUE NOT NULL,
    area_sq_km NUMERIC(10, 2) NOT NULL,
    annual_rainfall_normal_mm NUMERIC(8, 2) NOT NULL,
    cgwb_stage_extraction_pct NUMERIC(6, 2) NOT NULL,
    cgwb_category VARCHAR(32) NOT NULL, -- OVER-EXPLOITED, CRITICAL, SEMI-CRITICAL, SAFE
    geom_4326 GEOMETRY(MultiPolygon, 4326) NOT NULL,
    geom_32643 GEOMETRY(MultiPolygon, 32643) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_admin_geom_4326 ON administrative_boundaries USING GIST(geom_4326);
CREATE INDEX IF NOT EXISTS idx_admin_geom_32643 ON administrative_boundaries USING GIST(geom_32643);
CREATE INDEX IF NOT EXISTS idx_admin_taluk ON administrative_boundaries(taluk);

-- 2. Geological Formations (Hard-rock lithology)
CREATE TABLE IF NOT EXISTS geological_formations (
    id SERIAL PRIMARY KEY,
    lithology_code VARCHAR(16) NOT NULL,
    formation_name VARCHAR(128) NOT NULL,
    stratigraphic_group VARCHAR(128) NOT NULL,
    rock_type VARCHAR(64) NOT NULL,
    primary_aquifer_type VARCHAR(64) NOT NULL, -- WEATHERED, FRACTURED_SHEAR, METAVOLCANIC
    weathered_depth_mean_m NUMERIC(6, 2),
    specific_yield_est NUMERIC(5, 4),
    geom_4326 GEOMETRY(MultiPolygon, 4326) NOT NULL,
    geom_32643 GEOMETRY(MultiPolygon, 32643) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_geol_geom_4326 ON geological_formations USING GIST(geom_4326);
CREATE INDEX IF NOT EXISTS idx_geol_geom_32643 ON geological_formations USING GIST(geom_32643);

-- 3. Structural Lineaments and Faults
CREATE TABLE IF NOT EXISTS structural_lineaments (
    id SERIAL PRIMARY KEY,
    lineament_id VARCHAR(32) UNIQUE NOT NULL,
    feature_type VARCHAR(64) NOT NULL, -- FAULT, SHEAR_ZONE, PHOTOLINEAMENT, DYKE
    length_km NUMERIC(8, 3) NOT NULL,
    strike_azimuth NUMERIC(5, 1),
    geom_4326 GEOMETRY(MultiLineString, 4326) NOT NULL,
    geom_32643 GEOMETRY(MultiLineString, 32643) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_lin_geom_4326 ON structural_lineaments USING GIST(geom_4326);
CREATE INDEX IF NOT EXISTS idx_lin_geom_32643 ON structural_lineaments USING GIST(geom_32643);

-- 4. Surface Drainage and River Streams
CREATE TABLE IF NOT EXISTS drainage_streams (
    id SERIAL PRIMARY KEY,
    stream_id VARCHAR(32) UNIQUE NOT NULL,
    basin_name VARCHAR(64) NOT NULL, -- PALAR, SOUTH PENNAR, NORTH PENNAR
    stream_order INT NOT NULL,
    geom_4326 GEOMETRY(MultiLineString, 4326) NOT NULL,
    geom_32643 GEOMETRY(MultiLineString, 32643) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_drain_geom_4326 ON drainage_streams USING GIST(geom_4326);
CREATE INDEX IF NOT EXISTS idx_drain_geom_32643 ON drainage_streams USING GIST(geom_32643);

-- 5. Official CGWB / WRIS Monitoring Wells
CREATE TABLE IF NOT EXISTS cgwb_monitoring_wells (
    id SERIAL PRIMARY KEY,
    station_code VARCHAR(32) UNIQUE NOT NULL,
    station_name VARCHAR(128) NOT NULL,
    district VARCHAR(64) NOT NULL,
    taluk VARCHAR(64) NOT NULL,
    well_type VARCHAR(32) NOT NULL, -- PIEZOMETER, DUG_WELL, BORE_WELL
    depth_m NUMERIC(6, 2),
    pre_monsoon_depth_mgl NUMERIC(6, 2),
    post_monsoon_depth_mgl NUMERIC(6, 2),
    decadal_trend_m_per_year NUMERIC(6, 3),
    geom_4326 GEOMETRY(Point, 4326) NOT NULL,
    geom_32643 GEOMETRY(Point, 32643) NOT NULL,
    last_measured_year INT
);

CREATE INDEX IF NOT EXISTS idx_cgwb_geom_4326 ON cgwb_monitoring_wells USING GIST(geom_4326);
CREATE INDEX IF NOT EXISTS idx_cgwb_geom_32643 ON cgwb_monitoring_wells USING GIST(geom_32643);

-- 6. Borewell Ground Truth Observations (Class A, B, C, D)
CREATE TABLE IF NOT EXISTS borewell_observations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    borewell_id VARCHAR(64) UNIQUE NOT NULL,
    district VARCHAR(64) NOT NULL,
    taluk VARCHAR(64) NOT NULL,
    village VARCHAR(128),
    drilling_date DATE,
    total_depth_m NUMERIC(6, 2) NOT NULL,
    weathered_zone_depth_m NUMERIC(6, 2),
    geological_formation VARCHAR(128) NOT NULL,
    water_strike_depth_m NUMERIC(6, 2),
    static_water_level_m NUMERIC(6, 2),
    yield_lpm NUMERIC(8, 2),
    pumping_test_duration_hrs NUMERIC(5, 2),
    drawdown_m NUMERIC(6, 2),
    pre_monsoon_level_m NUMERIC(6, 2),
    post_monsoon_level_m NUMERIC(6, 2),
    borewell_outcome VARCHAR(32) NOT NULL,
    outcome_definition TEXT NOT NULL,
    evidence_source VARCHAR(128) NOT NULL,
    quality_tier VARCHAR(8) NOT NULL, -- A, B, C, D (E is quarantined to test tables)
    verification_status VARCHAR(32) NOT NULL,
    geom_4326 GEOMETRY(Point, 4326) NOT NULL,
    geom_32643 GEOMETRY(Point, 32643) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_bore_geom_4326 ON borewell_observations USING GIST(geom_4326);
CREATE INDEX IF NOT EXISTS idx_bore_geom_32643 ON borewell_observations USING GIST(geom_32643);
CREATE INDEX IF NOT EXISTS idx_bore_outcome ON borewell_observations(borewell_outcome);
CREATE INDEX IF NOT EXISTS idx_bore_quality ON borewell_observations(quality_tier);

-- 7. Assessment Evaluation Audit Log
CREATE TABLE IF NOT EXISTS assessment_records (
    assessment_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    latitude NUMERIC(10, 6) NOT NULL,
    longitude NUMERIC(10, 6) NOT NULL,
    district VARCHAR(64) NOT NULL,
    taluk VARCHAR(64) NOT NULL,
    model_version VARCHAR(32) NOT NULL,
    groundwater_potential_category VARCHAR(32) NOT NULL,
    potential_score NUMERIC(5, 4) NOT NULL,
    failure_risk_probability NUMERIC(5, 4),
    failure_risk_category VARCHAR(64) NOT NULL,
    advisory_recommendation VARCHAR(64) NOT NULL,
    expected_yield_min_lpm NUMERIC(6, 2),
    expected_yield_max_lpm NUMERIC(6, 2),
    recommended_depth_min_m NUMERIC(6, 2),
    recommended_depth_max_m NUMERIC(6, 2),
    uncertainty_level VARCHAR(32) NOT NULL,
    data_sufficiency_status VARCHAR(64) NOT NULL,
    feature_payload JSONB NOT NULL,
    explanation_summary TEXT NOT NULL,
    kannada_explanation TEXT,
    expert_reviewed BOOLEAN DEFAULT FALSE,
    geom_4326 GEOMETRY(Point, 4326) NOT NULL,
    geom_32643 GEOMETRY(Point, 32643) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_assess_geom_4326 ON assessment_records USING GIST(geom_4326);
CREATE INDEX IF NOT EXISTS idx_assess_created ON assessment_records(created_at DESC);
