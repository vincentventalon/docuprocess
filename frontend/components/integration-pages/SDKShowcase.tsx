"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Check, Copy } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import BadgePill from "@/components/ui/badge-pill";

interface SDKExample {
  language: string;
  syntaxLang: string;
  icon: React.ReactNode;
  package: string;
  packageManager: string;
  installCommand: string;
  href: string;
  code: string;
}

const sdkExamples: SDKExample[] = [
  {
    language: "TypeScript",
    syntaxLang: "typescript",
    icon: (
      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
        <path d="M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z"/>
      </svg>
    ),
    package: "@yourapp/sdk",
    packageManager: "npm",
    installCommand: "npm install @yourapp/sdk",
    href: "https://github.com/YourOrg/typescriptsdk",
    code: `// npm install @yourapp/sdk

import { YourApp } from "@yourapp/sdk";

const client = new YourApp({
  apiKey: "your-api-key",
});

const result = await client.pdf.generate({
  templateId: "your-template-id",
  data: {
    name: "John Doe",
    amount: "$1,500.00",
    date: "January 15, 2025",
  },
});

console.log(result.pdfUrl);
// https://storage.example.com/...`,
  },
  {
    language: "Python",
    syntaxLang: "python",
    icon: (
      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
        <path d="M14.25.18l.9.2.73.26.59.3.45.32.34.34.25.34.16.33.1.3.04.26.02.2-.01.13V8.5l-.05.63-.13.55-.21.46-.26.38-.3.31-.33.25-.35.19-.35.14-.33.1-.3.07-.26.04-.21.02H8.77l-.69.05-.59.14-.5.22-.41.27-.33.32-.27.35-.2.36-.15.37-.1.35-.07.32-.04.27-.02.21v3.06H3.17l-.21-.03-.28-.07-.32-.12-.35-.18-.36-.26-.36-.36-.35-.46-.32-.59-.28-.73-.21-.88-.14-1.05-.05-1.23.06-1.22.16-1.04.24-.87.32-.71.36-.57.4-.44.42-.33.42-.24.4-.16.36-.1.32-.05.24-.01h.16l.06.01h8.16v-.83H6.18l-.01-2.75-.02-.37.05-.34.11-.31.17-.28.25-.26.31-.23.38-.2.44-.18.51-.15.58-.12.64-.1.71-.06.77-.04.84-.02 1.27.05zm-6.3 1.98l-.23.33-.08.41.08.41.23.34.33.22.41.09.41-.09.33-.22.23-.34.08-.41-.08-.41-.23-.33-.33-.22-.41-.09-.41.09zm13.09 3.95l.28.06.32.12.35.18.36.27.36.35.35.47.32.59.28.73.21.88.14 1.04.05 1.23-.06 1.23-.16 1.04-.24.86-.32.71-.36.57-.4.45-.42.33-.42.24-.4.16-.36.09-.32.05-.24.02-.16-.01h-8.22v.82h5.84l.01 2.76.02.36-.05.34-.11.31-.17.29-.25.25-.31.24-.38.2-.44.17-.51.15-.58.13-.64.09-.71.07-.77.04-.84.01-1.27-.04-1.07-.14-.9-.2-.73-.25-.59-.3-.45-.33-.34-.34-.25-.34-.16-.33-.1-.3-.04-.25-.02-.2.01-.13v-5.34l.05-.64.13-.54.21-.46.26-.38.3-.32.33-.24.35-.2.35-.14.33-.1.3-.06.26-.04.21-.02.13-.01h5.84l.69-.05.59-.14.5-.21.41-.28.33-.32.27-.35.2-.36.15-.36.1-.35.07-.32.04-.28.02-.21V6.07h2.09l.14.01zm-6.47 14.25l-.23.33-.08.41.08.41.23.33.33.23.41.08.41-.08.33-.23.23-.33.08-.41-.08-.41-.23-.33-.33-.23-.41-.08-.41.08z"/>
      </svg>
    ),
    package: "yourapp",
    packageManager: "PyPI",
    installCommand: "pip install yourapp",
    href: "https://github.com/YourOrg/pythonsdk",
    code: `# pip install yourapp

from yourapp import YourApp

client = YourApp(api_key="your-api-key")

result = client.pdf.generate(
    template_id="your-template-id",
    data={
        "name": "John Doe",
        "amount": "$1,500.00",
        "date": "January 15, 2025",
    }
)

print(result.pdf_url)
# https://storage.example.com/...`,
  },
  {
    language: "Go",
    syntaxLang: "go",
    icon: (
      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
        <path d="M1.811 10.231c-.047 0-.058-.023-.035-.059l.246-.315c.023-.035.081-.058.128-.058h4.172c.046 0 .058.035.035.07l-.199.303c-.023.036-.082.07-.117.07zM.047 11.306c-.047 0-.059-.023-.035-.058l.245-.316c.023-.035.082-.058.129-.058h5.328c.047 0 .07.035.058.07l-.093.28c-.012.047-.058.07-.105.07zm2.828 1.075c-.047 0-.059-.035-.035-.07l.163-.292c.023-.035.07-.07.117-.07h2.337c.047 0 .07.035.07.082l-.023.28c0 .047-.047.082-.082.082zm12.129-2.36c-.736.187-1.239.327-1.963.514-.176.046-.187.058-.34-.117-.174-.199-.303-.327-.548-.444-.737-.362-1.45-.257-2.115.175-.795.514-1.204 1.274-1.192 2.22.011.935.654 1.706 1.577 1.835.795.105 1.46-.175 1.987-.77.105-.13.198-.27.315-.434H10.47c-.245 0-.304-.152-.222-.35.152-.362.432-.97.596-1.274a.315.315 0 01.292-.187h4.253c-.023.316-.023.631-.07.947a4.983 4.983 0 01-.958 2.29c-.841 1.11-1.94 1.8-3.33 1.986-1.145.152-2.209-.07-3.143-.77-.865-.655-1.356-1.52-1.484-2.595-.152-1.274.222-2.419.993-3.424.83-1.086 1.928-1.776 3.272-2.02 1.098-.2 2.15-.07 3.096.571.62.41 1.063.97 1.356 1.648.07.105.023.164-.117.2m3.868 6.461c-1.064-.024-2.034-.328-2.852-1.029a3.665 3.665 0 01-1.262-2.255c-.21-1.32.152-2.489.947-3.529.853-1.122 1.881-1.706 3.272-1.95 1.192-.21 2.314-.095 3.33.595.923.63 1.496 1.484 1.648 2.605.198 1.578-.257 2.863-1.344 3.962-.771.783-1.718 1.273-2.805 1.495-.315.06-.63.07-.934.106zm2.78-4.72c-.011-.153-.011-.27-.034-.387-.21-1.157-1.274-1.81-2.384-1.554-1.087.245-1.788.935-2.045 2.033-.21.912.234 1.835 1.075 2.21.643.28 1.285.244 1.905-.07.923-.48 1.425-1.228 1.484-2.233z"/>
      </svg>
    ),
    package: "github.com/YourOrg/gosdk",
    packageManager: "Go Modules",
    installCommand: "go get github.com/YourOrg/gosdk",
    href: "https://github.com/YourOrg/gosdk",
    code: `// go get github.com/YourOrg/gosdk

package main

import (
    "fmt"
    yourapp "github.com/YourOrg/gosdk"
)

func main() {
    client := yourapp.NewClient("your-api-key")

    result, err := client.PDF.Generate(&yourapp.GenerateOptions{
        TemplateID: "your-template-id",
        Data: map[string]interface{}{
            "name":   "John Doe",
            "amount": "$1,500.00",
            "date":   "January 15, 2025",
        },
    })

    if err != nil {
        panic(err)
    }

    fmt.Println(result.PDFUrl)
    // https://storage.example.com/...
}`,
  },
  {
    language: "PHP",
    syntaxLang: "php",
    icon: (
      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
        <path d="M7.01 10.207h-.944l-.515 2.648h.838c.556 0 .97-.105 1.242-.314.272-.21.455-.559.55-1.049.092-.47.05-.802-.124-.995-.175-.193-.523-.29-1.047-.29zM12 5.688C5.373 5.688 0 8.514 0 12s5.373 6.313 12 6.313S24 15.486 24 12c0-3.486-5.373-6.312-12-6.312zm-3.26 7.451c-.261.25-.575.438-.917.551-.336.108-.765.164-1.285.164H5.357l-.327 1.681H3.652l1.23-6.326h2.65c.797 0 1.378.209 1.744.628.366.418.476 1.002.33 1.752a2.836 2.836 0 0 1-.305.847c-.143.255-.33.49-.561.703zm4.024.715l.543-2.799c.063-.318.039-.536-.068-.651-.107-.116-.336-.174-.687-.174H11.46l-.704 3.625H9.388l1.23-6.327h1.367l-.327 1.682h1.218c.767 0 1.295.134 1.586.401s.378.7.263 1.299l-.572 2.944h-1.389zm7.597-2.265a2.782 2.782 0 0 1-.305.847c-.143.255-.33.49-.561.703a2.44 2.44 0 0 1-.917.551c-.336.108-.765.164-1.286.164h-1.18l-.327 1.682h-1.378l1.23-6.326h2.649c.797 0 1.378.209 1.744.628.366.417.477 1.001.331 1.751zm-2.595-1.382h-.943l-.516 2.648h.838c.557 0 .971-.105 1.242-.314.272-.21.455-.559.551-1.049.092-.47.049-.802-.125-.995s-.524-.29-1.047-.29z"/>
      </svg>
    ),
    package: "yourapp/sdk",
    packageManager: "Packagist",
    installCommand: "composer require yourapp/sdk",
    href: "https://github.com/YourOrg/phpsdk",
    code: `// composer require yourapp/sdk

<?php

use YourApp\\YourApp;

$client = new YourApp('your-api-key');

$result = $client->pdf->generate([
    'template_id' => 'your-template-id',
    'data' => [
        'name' => 'John Doe',
        'amount' => '$1,500.00',
        'date' => 'January 15, 2025',
    ],
]);

echo $result->pdfUrl;
// https://storage.example.com/...`,
  },
  {
    language: "Ruby",
    syntaxLang: "ruby",
    icon: (
      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
        <path d="M20.156.083c3.033.525 3.893 2.598 3.829 4.77L24 4.822 22.635 22.71 4.89 23.926h.016C3.433 23.864.15 23.729 0 19.139l1.645-3 2.819 6.586.503 1.172 2.805-9.144-.03.007.016-.03 9.255 2.956-1.396-5.431-.99-3.9 8.82-.569-.615-.51L16.5 2.114 20.159.073l-.003.01zM0 19.089zM5.13 5.073c3.561-3.533 8.157-5.621 9.922-3.84 1.762 1.777-.105 6.105-3.673 9.636-3.563 3.532-8.103 5.734-9.864 3.957-1.766-1.777.045-6.217 3.612-9.75l.003-.003z"/>
      </svg>
    ),
    package: "yourapp",
    packageManager: "RubyGems",
    installCommand: "gem install yourapp",
    href: "https://github.com/YourOrg/rubysdk",
    code: `# gem install yourapp

require 'yourapp'

client = YourApp::Client.new(api_key: 'your-api-key')

result = client.pdf.generate(
  template_id: 'your-template-id',
  data: {
    name: 'John Doe',
    amount: '$1,500.00',
    date: 'January 15, 2025'
  }
)

puts result.pdf_url
# https://storage.example.com/...`,
  },
  {
    language: "Java",
    syntaxLang: "java",
    icon: (
      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
        <path d="M8.851 18.56s-.917.534.653.714c1.902.218 2.874.187 4.969-.211 0 0 .552.346 1.321.646-4.699 2.013-10.633-.118-6.943-1.149M8.276 15.933s-1.028.761.542.924c2.032.209 3.636.227 6.413-.308 0 0 .384.389.987.602-5.679 1.661-12.007.13-7.942-1.218M13.116 11.475c1.158 1.333-.304 2.533-.304 2.533s2.939-1.518 1.589-3.418c-1.261-1.772-2.228-2.652 3.007-5.688 0-.001-8.216 2.051-4.292 6.573M19.33 20.504s.679.559-.747.991c-2.712.822-11.288 1.069-13.669.033-.856-.373.75-.89 1.254-.998.527-.114.828-.093.828-.093-.953-.671-6.156 1.317-2.643 1.887 9.58 1.553 17.462-.7 14.977-1.82M9.292 13.21s-4.362 1.036-1.544 1.412c1.189.159 3.561.123 5.77-.062 1.806-.152 3.618-.477 3.618-.477s-.637.272-1.098.587c-4.429 1.165-12.986.623-10.522-.568 2.082-1.006 3.776-.892 3.776-.892M17.116 17.584c4.503-2.34 2.421-4.589.968-4.285-.355.074-.515.138-.515.138s.132-.207.385-.297c2.875-1.011 5.086 2.981-.928 4.562 0-.001.07-.062.09-.118M14.401 0s2.494 2.494-2.365 6.33c-3.896 3.077-.889 4.832-.001 6.836-2.274-2.053-3.943-3.858-2.824-5.539 1.644-2.469 6.197-3.665 5.19-7.627M9.734 23.924c4.322.277 10.959-.153 11.116-2.198 0 0-.302.775-3.572 1.391-3.688.694-8.239.613-10.937.168 0-.001.553.457 3.393.639"/>
      </svg>
    ),
    package: "io.github.yourapppdf:sdk",
    packageManager: "Maven",
    installCommand: "Maven Central",
    href: "https://github.com/YourOrg/javasdk",
    code: `// Add to pom.xml:
// <dependency>
//   <groupId>io.github.yourapppdf</groupId>
//   <artifactId>sdk</artifactId>
//   <version>1.0.0</version>
// </dependency>

import io.github.yourapppdf.YourApp;
import io.github.yourapppdf.models.GenerateRequest;

public class App {
    public static void main(String[] args) {
        YourApp client = new YourApp("your-api-key");

        Map<String, Object> data = new HashMap<>();
        data.put("name", "John Doe");
        data.put("amount", "$1,500.00");
        data.put("date", "January 15, 2025");

        var result = client.pdf().generate(
            new GenerateRequest("your-template-id", data)
        );

        System.out.println(result.getPdfUrl());
        // https://storage.example.com/...
    }
}`,
  },
  {
    language: "C#",
    syntaxLang: "csharp",
    icon: (
      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
        <path d="M12 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0zM9.426 7.12a5.55 5.55 0 011.985.38v1.181a4.5 4.5 0 00-2.018-.466 3.51 3.51 0 00-2.725 1.17 4.291 4.291 0 00-1.057 2.98 4.084 4.084 0 00.992 2.856 3.318 3.318 0 002.6 1.117 4.724 4.724 0 002.208-.545v1.17a5.4 5.4 0 01-2.407.525 4.4 4.4 0 01-3.413-1.404 5.139 5.139 0 01-1.29-3.635 5.498 5.498 0 011.342-3.842 4.662 4.662 0 013.783-1.487zm7.51.122h.79l.252 1.025h.05a2.094 2.094 0 01.755-.869 1.85 1.85 0 011.07-.347c.196-.002.39.03.576.095l-.197 1.039a1.546 1.546 0 00-.494-.066 1.488 1.488 0 00-1.213.619 2.57 2.57 0 00-.49 1.656v4.21h-1.1zm-2.751.126h1.1l1.392 5.135c.095.376.166.71.214 1.004h.04c.07-.334.15-.67.24-.999l1.44-5.14h1.064l-2.27 7.493h-1.09z"/>
      </svg>
    ),
    package: "YourApp.SDK",
    packageManager: "NuGet",
    installCommand: "dotnet add package YourApp.SDK",
    href: "https://github.com/YourOrg/csharpsdk",
    code: `// dotnet add package YourApp.SDK

using YourApp;

var client = new YourAppClient("your-api-key");

var result = await client.Pdf.GenerateAsync(new GenerateRequest
{
    TemplateId = "your-template-id",
    Data = new Dictionary<string, object>
    {
        ["name"] = "John Doe",
        ["amount"] = "$1,500.00",
        ["date"] = "January 15, 2025"
    }
});

Console.WriteLine(result.PdfUrl);
// https://storage.example.com/...`,
  },
];

export function SDKShowcase() {
  const [activeSDK, setActiveSDK] = useState(0);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(sdkExamples[activeSDK].code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="sdks" className="py-20 lg:py-28 bg-slate-900">
      <div className="max-w-5xl mx-auto px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <BadgePill className="bg-purple-100 text-purple-600">
            Official SDKs
          </BadgePill>
          <h2 className="font-bold text-3xl md:text-4xl tracking-tight mb-4 mt-4 text-white">
            Use the language you love
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Send simple HTTP requests or use native libraries for your language of choice.
          </p>
        </div>

        {/* Language Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {sdkExamples.map((sdk, index) => (
            <button
              key={sdk.language}
              onClick={() => setActiveSDK(index)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
                activeSDK === index
                  ? "bg-primary text-white shadow-lg shadow-primary/25"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
              }`}
            >
              {sdk.icon}
              {sdk.language}
            </button>
          ))}
        </div>

        {/* Code Block */}
        <div className="relative bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
          {/* Header bar */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/50">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <span className="text-xs text-slate-500 font-mono">
                {sdkExamples[activeSDK].installCommand}
              </span>
            </div>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors text-sm"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          {/* Code content */}
          <div className="overflow-x-auto">
            <SyntaxHighlighter
              language={sdkExamples[activeSDK].syntaxLang}
              style={vscDarkPlus}
              showLineNumbers
              customStyle={{
                margin: 0,
                padding: "1.5rem",
                background: "transparent",
                fontSize: "0.875rem",
                lineHeight: "1.6",
              }}
              lineNumberStyle={{
                minWidth: "2.5em",
                paddingRight: "1em",
                color: "#64748b",
                userSelect: "none",
              }}
              wrapLongLines
            >
              {sdkExamples[activeSDK].code}
            </SyntaxHighlighter>
          </div>
        </div>

        {/* SDK Links */}
        <div className="mt-8 text-center">
          <Link
            href={sdkExamples[activeSDK].href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white text-purple-600 border-2 border-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-purple-50 transition-colors"
          >
            View {sdkExamples[activeSDK].language} SDK on GitHub
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}

