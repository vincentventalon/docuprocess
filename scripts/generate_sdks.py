#!/usr/bin/env python3
"""
Generate SDKs for all supported languages using OpenAPI Generator.

Usage:
    cd backend && uv run python ../scripts/generate_sdks.py
    cd backend && uv run python ../scripts/generate_sdks.py --lang python
    cd backend && uv run python ../scripts/generate_sdks.py --lang typescript python

Prerequisites:
    - OpenAPI Generator CLI installed: brew install openapi-generator
    - Or via npm: npm install @openapitools/openapi-generator-cli -g
    - Docker alternative: docker pull openapitools/openapi-generator-cli

This script:
1. Cleans generated/sdks/ directory (or specific language)
2. Runs OpenAPI Generator for each language
3. Copies README from sdk-docs/{lang}/
4. Runs quality validation (compile/build test)
5. Reports success/failure summary
"""

import argparse
import json
import shutil
import subprocess
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Optional

# Project paths
PROJECT_ROOT = Path(__file__).parent.parent
GENERATED_DIR = PROJECT_ROOT / "generated"
SDKS_DIR = GENERATED_DIR / "sdks"
SDK_DOCS_DIR = PROJECT_ROOT / "sdk-docs"
SDK_CONFIGS_DIR = Path(__file__).parent / "sdk_configs"
OPENAPI_SPEC = GENERATED_DIR / "openapi.json"


@dataclass
class SDKConfig:
    """Configuration for an SDK language."""

    name: str
    generator: str
    config_file: str
    validation_cmd: Optional[list[str]] = None
    validation_cwd: Optional[str] = None


# SDK configurations
SDKS: dict[str, SDKConfig] = {
    "typescript": SDKConfig(
        name="TypeScript",
        generator="typescript-fetch",
        config_file="typescript.yaml",
        validation_cmd=["npm", "install"],
        validation_cwd="typescript",
    ),
    "python": SDKConfig(
        name="Python",
        generator="python",
        config_file="python.yaml",
        validation_cmd=["python", "-c", "import sys; sys.path.insert(0, '.'); import yourapp"],
        validation_cwd="python",
    ),
    "java": SDKConfig(
        name="Java",
        generator="java",
        config_file="java.yaml",
        validation_cmd=["mvn", "compile", "-q"],
        validation_cwd="java",
    ),
    "go": SDKConfig(
        name="Go",
        generator="go",
        config_file="go.yaml",
        validation_cmd=["go", "build", "./..."],
        validation_cwd="go",
    ),
    "php": SDKConfig(
        name="PHP",
        generator="php",
        config_file="php.yaml",
        validation_cmd=["php", "-l", "lib/Api/DefaultApi.php"],
        validation_cwd="php",
    ),
    "ruby": SDKConfig(
        name="Ruby",
        generator="ruby",
        config_file="ruby.yaml",
        validation_cmd=["ruby", "-c", "lib/yourapp.rb"],
        validation_cwd="ruby",
    ),
    "csharp": SDKConfig(
        name="C#",
        generator="csharp",
        config_file="csharp.yaml",
        validation_cmd=["dotnet", "build", "-c", "Release"],
        validation_cwd="csharp",
    ),
}


def get_openapi_version() -> str:
    """Read version from OpenAPI spec."""
    with open(OPENAPI_SPEC, "r") as f:
        spec = json.load(f)
    return spec["info"]["version"]


def check_prerequisites() -> bool:
    """Check if OpenAPI Generator is installed."""
    try:
        result = subprocess.run(
            ["openapi-generator", "version"],
            capture_output=True,
            text=True,
        )
        if result.returncode == 0:
            print(f"OpenAPI Generator version: {result.stdout.strip()}")
            return True
    except FileNotFoundError:
        pass

    # Try npx version
    try:
        result = subprocess.run(
            ["npx", "@openapitools/openapi-generator-cli", "version"],
            capture_output=True,
            text=True,
        )
        if result.returncode == 0:
            print(f"OpenAPI Generator (npx) version: {result.stdout.strip()}")
            return True
    except FileNotFoundError:
        pass

    print("ERROR: OpenAPI Generator not found.")
    print("Install with: brew install openapi-generator")
    print("Or: npm install @openapitools/openapi-generator-cli -g")
    return False


def get_openapi_generator_cmd() -> list[str]:
    """Get the OpenAPI Generator command (native or npx)."""
    try:
        result = subprocess.run(
            ["openapi-generator", "version"],
            capture_output=True,
            text=True,
        )
        if result.returncode == 0:
            return ["openapi-generator"]
    except FileNotFoundError:
        pass

    return ["npx", "@openapitools/openapi-generator-cli"]


def clean_sdk_dir(lang: str) -> None:
    """Clean the SDK output directory for a language."""
    sdk_dir = SDKS_DIR / lang
    if sdk_dir.exists():
        print(f"  Cleaning {sdk_dir}...")
        shutil.rmtree(sdk_dir)
    sdk_dir.mkdir(parents=True, exist_ok=True)


def generate_sdk(lang: str, config: SDKConfig, generator_cmd: list[str], version: str) -> bool:
    """Generate SDK for a specific language."""
    print(f"\n{'='*60}")
    print(f"Generating {config.name} SDK (version {version})")
    print(f"{'='*60}")

    # Check config file exists
    config_path = SDK_CONFIGS_DIR / config.config_file
    if not config_path.exists():
        print(f"  ERROR: Config file not found: {config_path}")
        return False

    # Clean output directory
    clean_sdk_dir(lang)

    # Map language to version property name used by OpenAPI Generator
    version_props = {
        "python": "packageVersion",
        "typescript": "npmVersion",
        "java": "artifactVersion",
        "go": "packageVersion",
        "php": "artifactVersion",
        "ruby": "gemVersion",
        "csharp": "packageVersion",
    }
    version_prop = version_props.get(lang, "packageVersion")

    # Build generator command
    output_dir = SDKS_DIR / lang
    cmd = generator_cmd + [
        "generate",
        "-i",
        str(OPENAPI_SPEC),
        "-g",
        config.generator,
        "-o",
        str(output_dir),
        "-c",
        str(config_path),
        "--skip-validate-spec",
        "-p",
        f"{version_prop}={version}",
    ]

    print(f"  Running: {' '.join(cmd)}")

    try:
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            cwd=PROJECT_ROOT,
        )

        if result.returncode != 0:
            print(f"  ERROR: Generation failed")
            print(f"  stdout: {result.stdout}")
            print(f"  stderr: {result.stderr}")
            return False

        print(f"  Generated successfully to {output_dir}")

    except Exception as e:
        print(f"  ERROR: {e}")
        return False

    # Copy README from sdk-docs if exists
    readme_src = SDK_DOCS_DIR / lang / "README.md"
    readme_dst = output_dir / "README.md"

    if readme_src.exists():
        print(f"  Copying README from {readme_src}")
        shutil.copy2(readme_src, readme_dst)
    else:
        print(f"  NOTE: No custom README found at {readme_src}")

    # Copy LICENSE
    license_src = PROJECT_ROOT / "LICENSE"
    if license_src.exists():
        shutil.copy2(license_src, output_dir / "LICENSE")
        print(f"  Copied LICENSE")

    # Post-process SDK metadata
    post_process_sdk(lang, output_dir)

    return True


def post_process_sdk(lang: str, output_dir: Path) -> None:
    """Apply post-processing fixes that can't be done via OpenAPI Generator config."""

    if lang == "typescript":
        # Fix package.json metadata
        package_json_path = output_dir / "package.json"
        if package_json_path.exists():
            with open(package_json_path, "r") as f:
                pkg = json.load(f)

            pkg["author"] = "YourOrg"
            pkg["license"] = "MIT"
            pkg["description"] = "Official SDK for YourApp API"
            pkg["homepage"] = "https://example.com"
            pkg["keywords"] = ["api", "sdk"]
            pkg["bugs"] = {"url": "https://github.com/YourOrg/typescriptsdk/issues"}

            with open(package_json_path, "w") as f:
                json.dump(pkg, f, indent=2)
                f.write("\n")

            print(f"  Post-processed package.json")

    elif lang == "python":
        # Fix pyproject.toml metadata
        pyproject_path = output_dir / "pyproject.toml"
        if pyproject_path.exists():
            content = pyproject_path.read_text()

            # Update description and add license if missing
            if 'license' not in content:
                content = content.replace(
                    'description = "YourApp API"',
                    'description = "Official SDK for YourApp API"\nlicense = {text = "MIT"}'
                )

            # Update keywords
            content = content.replace(
                'keywords = ["OpenAPI", "OpenAPI-Generator", "YourApp API"]',
                'keywords = ["api", "sdk"]'
            )

            # Add homepage and other URLs
            content = content.replace(
                '[project.urls]\nRepository = "https://github.com/YourOrg/pythonsdk"',
                '[project.urls]\nHomepage = "https://example.com"\nRepository = "https://github.com/YourOrg/pythonsdk"\nIssues = "https://github.com/YourOrg/pythonsdk/issues"\nDocumentation = "https://example.com/docs"'
            )

            pyproject_path.write_text(content)
            print(f"  Post-processed pyproject.toml")

    elif lang == "ruby":
        # Fix gemspec homepage and metadata
        gemspec_path = output_dir / "yourapp.gemspec"
        if gemspec_path.exists():
            content = gemspec_path.read_text()
            content = content.replace(
                's.homepage    = "https://github.com/YourOrg/rubysdk"',
                's.homepage    = "https://example.com"'
            )
            content = content.replace(
                "s.metadata    = {}",
                's.metadata    = {\n'
                '    "source_code_uri"   => "https://github.com/YourOrg/rubysdk",\n'
                '    "bug_tracker_uri"   => "https://github.com/YourOrg/rubysdk/issues",\n'
                '    "documentation_uri" => "https://example.com/docs",\n'
                '    "homepage_uri"      => "https://example.com"\n'
                '  }'
            )
            gemspec_path.write_text(content)
            print(f"  Post-processed yourapp.gemspec")

    elif lang == "java":
        # Add Maven Central publishing plugin to pom.xml
        pom_path = output_dir / "pom.xml"
        if pom_path.exists():
            content = pom_path.read_text()

            # Add central-publishing-maven-plugin for Maven Central deployment
            central_plugin = """            <plugin>
                <groupId>org.sonatype.central</groupId>
                <artifactId>central-publishing-maven-plugin</artifactId>
                <version>0.7.0</version>
                <extensions>true</extensions>
                <configuration>
                    <publishingServerId>central</publishingServerId>
                    <autoPublish>true</autoPublish>
                </configuration>
            </plugin>"""

            # Insert before closing </plugins> tag in the main build section
            # (not inside the sign-artifacts profile)
            content = content.replace(
                "        </plugins>\n    </build>\n\n    <profiles>",
                f"{central_plugin}\n        </plugins>\n    </build>\n\n    <profiles>",
            )

            pom_path.write_text(content)
            print(f"  Post-processed pom.xml (added Maven Central publishing plugin)")

    elif lang == "php":
        # Fix composer.json description and remove hardcoded version (Packagist uses git tags)
        composer_path = output_dir / "composer.json"
        if composer_path.exists():
            with open(composer_path, "r") as f:
                composer = json.load(f)

            # Remove version field - Packagist should get versions from git tags
            composer.pop("version", None)
            composer["description"] = "Official SDK for YourApp API"
            composer["homepage"] = "https://example.com"
            composer["keywords"] = ["api", "sdk"]
            composer["support"] = {
                "issues": "https://github.com/YourOrg/phpsdk/issues",
                "source": "https://github.com/YourOrg/phpsdk"
            }

            with open(composer_path, "w") as f:
                json.dump(composer, f, indent=4)
                f.write("\n")

            print(f"  Post-processed composer.json")


def validate_sdk(lang: str, config: SDKConfig) -> bool:
    """Run validation command for the SDK."""
    if not config.validation_cmd:
        print(f"  No validation configured for {config.name}")
        return True

    sdk_dir = SDKS_DIR / lang
    cwd = sdk_dir if not config.validation_cwd else sdk_dir

    print(f"  Validating: {' '.join(config.validation_cmd)}")

    try:
        result = subprocess.run(
            config.validation_cmd,
            capture_output=True,
            text=True,
            cwd=cwd,
            timeout=120,
        )

        if result.returncode != 0:
            print(f"  WARNING: Validation failed (non-critical)")
            if result.stderr:
                print(f"  stderr: {result.stderr[:500]}")
            return False

        print(f"  Validation passed")
        return True

    except subprocess.TimeoutExpired:
        print(f"  WARNING: Validation timed out")
        return False
    except FileNotFoundError as e:
        print(f"  WARNING: Validation command not found: {e}")
        return False
    except Exception as e:
        print(f"  WARNING: Validation error: {e}")
        return False


def main():
    parser = argparse.ArgumentParser(
        description="Generate SDKs for YourApp API",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
    Generate all SDKs:
        uv run python ../scripts/generate_sdks.py

    Generate specific language:
        uv run python ../scripts/generate_sdks.py --lang python

    Generate multiple languages:
        uv run python ../scripts/generate_sdks.py --lang typescript python go

    Skip validation:
        uv run python ../scripts/generate_sdks.py --no-validate
        """,
    )

    parser.add_argument(
        "--lang",
        nargs="+",
        choices=list(SDKS.keys()),
        help="Languages to generate (default: all)",
    )

    parser.add_argument(
        "--no-validate",
        action="store_true",
        help="Skip validation step",
    )

    parser.add_argument(
        "--clean-only",
        action="store_true",
        help="Only clean the SDKs directory without generating",
    )

    args = parser.parse_args()

    # Determine which languages to generate
    languages = args.lang if args.lang else list(SDKS.keys())

    print("SDK Generator")
    print(f"Languages: {', '.join(languages)}")
    print()

    # Check OpenAPI spec exists
    if not OPENAPI_SPEC.exists():
        print(f"ERROR: OpenAPI spec not found at {OPENAPI_SPEC}")
        print("Run 'uv run python ../scripts/generate.py' first")
        sys.exit(1)

    # Clean only mode
    if args.clean_only:
        print("Cleaning SDKs directory...")
        for lang in languages:
            clean_sdk_dir(lang)
        print("Done!")
        sys.exit(0)

    # Check prerequisites
    if not check_prerequisites():
        sys.exit(1)

    generator_cmd = get_openapi_generator_cmd()

    # Read version from OpenAPI spec
    version = get_openapi_version()
    print(f"OpenAPI spec version: {version}")

    # Generate SDKs
    results: dict[str, dict[str, bool]] = {}

    for lang in languages:
        config = SDKS[lang]
        results[lang] = {"generated": False, "validated": False}

        # Generate
        if generate_sdk(lang, config, generator_cmd, version):
            results[lang]["generated"] = True

            # Validate
            if not args.no_validate:
                results[lang]["validated"] = validate_sdk(lang, config)
            else:
                results[lang]["validated"] = True

    # Print summary
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)

    success_count = 0
    for lang, result in results.items():
        status = "OK" if result["generated"] else "FAILED"
        validation = "validated" if result["validated"] else "not validated"
        print(f"  {SDKS[lang].name:12} : {status:6} ({validation})")
        if result["generated"]:
            success_count += 1

    print()
    print(f"Generated: {success_count}/{len(languages)} SDKs")

    if success_count < len(languages):
        sys.exit(1)

    print("\nSDKs generated successfully!")
    print(f"Output directory: {SDKS_DIR}")


if __name__ == "__main__":
    main()
